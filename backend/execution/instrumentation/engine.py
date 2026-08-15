import re
import os

CPP_PREAMBLE = """// ==========================================
// Dry-Run Analyzer Instrumentation Header
// ==========================================
#include <iostream>
#include <string>

template<typename T>
void __trace_var(int line, const char* name, const T& val) {
    std::cerr << "{\\"type\\":\\"assignment\\",\\"line\\":" << line << ",\\"variable\\":\\"" << name << "\\",\\"value\\":" << val << "}" << std::endl;
}

inline void __trace_var(int line, const char* name, const std::string& val) {
    std::cerr << "{\\"type\\":\\"assignment\\",\\"line\\":" << line << ",\\"variable\\":\\"" << name << "\\",\\"value\\":\\"" << val << "\\"}" << std::endl;
}

inline void __trace_var(int line, const char* name, const char* val) {
    std::cerr << "{\\"type\\":\\"assignment\\",\\"line\\":" << line << ",\\"variable\\":\\"" << name << "\\",\\"value\\":\\"" << val << "\\"}" << std::endl;
}

inline void __trace_var(int line, const char* name, char val) {
    std::cerr << "{\\"type\\":\\"assignment\\",\\"line\\":" << line << ",\\"variable\\":\\"" << name << "\\",\\"value\\":\\"" << val << "\\"}" << std::endl;
}

inline void __trace_var(int line, const char* name, bool val) {
    std::cerr << "{\\"type\\":\\"assignment\\",\\"line\\":" << line << ",\\"variable\\":\\"" << name << "\\",\\"value\\":" << (val ? "true" : "false") << "}" << std::endl;
}

inline void __trace_line(int line) {
    std::cerr << "{\\"type\\":\\"line\\",\\"line\\":" << line << "}" << std::endl;
}
// ==========================================
"""

class CppInstrumenter:
    """
    Instruments C++ source files by injecting logging calls to output trace events.
    Tracks line hits and variable assignments for primitives and std::string.
    """
    
    # Matches types: int, double, float, char, bool, std::string
    VAR_DECL_PATTERN = re.compile(
        r'\b(int|double|float|char|bool|std::string)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([^;]+);'
    )
    
    # Matches variable assignments: x = expr;
    VAR_ASSIGN_PATTERN = re.compile(
        r'\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(=|\+=|-=|\*=|\/=|%=)\s*([^;]+);'
    )
    
    # Matches increment/decrement: x++; ++x; x--; --x;
    VAR_INC_DEC_PATTERN = re.compile(
        r'\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(\+\+|--);|(\+\+|--)\s*([a-zA-Z_][a-zA-Z0-9_]*);'
    )

    def __init__(self):
        pass
        
    def instrument(self, source_code: str) -> str:
        """
        Instruments a C++ source code string and returns the modified code.
        """
        lines = source_code.splitlines()
        instrumented_lines = []
        
        instrumented_lines.append(CPP_PREAMBLE)
        
        brace_depth = 0
        in_multiline_comment = False
        
        for idx, line in enumerate(lines, start=1):
            stripped = line.strip()
            
            # 1. Handle Comments & Preprocessor Directives
            if in_multiline_comment:
                if "*/" in stripped:
                    in_multiline_comment = False
                instrumented_lines.append(line)
                continue
            if stripped.startswith("/*"):
                if "*/" not in stripped:
                    in_multiline_comment = True
                instrumented_lines.append(line)
                continue
            if stripped.startswith("//") or stripped.startswith("#"):
                instrumented_lines.append(line)
                continue
                
            # 2. Track scope/blocks via braces
            open_braces = stripped.count("{")
            close_braces = stripped.count("}")
            
            # Simple heuristic: we are in code blocks when brace_depth > 0
            prev_depth = brace_depth
            brace_depth += (open_braces - close_braces)
            
            # Only instrument lines inside function scopes
            if prev_depth == 0 and brace_depth == 0:
                instrumented_lines.append(line)
                continue
                
            # 3. Detect variables and inject tracing
            # Skip empty lines, lines with just brackets, or return statements when doing assignments
            if not stripped or stripped in ("{", "}", "{};"):
                instrumented_lines.append(line)
                continue
                
            # Determine if we should inject line hits (e.g. contains loop headers or expressions)
            is_executable = (
                ";" in stripped or 
                stripped.startswith("for") or 
                stripped.startswith("while") or 
                stripped.startswith("if")
            )
            
            if not is_executable:
                instrumented_lines.append(line)
                continue
                
            line_instrumented = line
            
            # Inject line trace before statement
            prefix = f"__trace_line({idx}); "
            
            # Check return statement to avoid placing trailing logs
            if stripped.startswith("return"):
                instrumented_lines.append(f"{prefix}{line_instrumented}")
                continue
                
            # Check for variable updates on this line
            var_found = None
            
            is_control_flow = (
                stripped.startswith("for") or 
                stripped.startswith("while") or 
                stripped.startswith("if") or 
                stripped.startswith("else") or 
                stripped.startswith("switch")
            )
            
            if not is_control_flow:
                # Look for: type var = expr;
                decl_match = self.VAR_DECL_PATTERN.search(stripped)
                if decl_match:
                    var_found = decl_match.group(2)
                    
                if not var_found:
                    # Look for: var = expr;
                    assign_match = self.VAR_ASSIGN_PATTERN.search(stripped)
                    if assign_match:
                        var_found = assign_match.group(1)
                        
                if not var_found:
                    # Look for: var++;
                    inc_dec_match = self.VAR_INC_DEC_PATTERN.search(stripped)
                    if inc_dec_match:
                        var_found = inc_dec_match.group(1) or inc_dec_match.group(4)
            
            if var_found:
                suffix = f" __trace_var({idx}, \"{var_found}\", {var_found});"
                line_instrumented = f"{prefix}{line_instrumented}{suffix}"
            else:
                line_instrumented = f"{prefix}{line_instrumented}"
                
            instrumented_lines.append(line_instrumented)
            
        return "\n".join(instrumented_lines)
