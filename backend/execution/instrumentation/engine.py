import re
from tree_sitter import Parser, Language
import tree_sitter_cpp as tscpp

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
    Compiler-aware C++ code instrumenter using Tree-sitter AST parsing.
    Tracks line hits and variable assignments for primitives and std::string.
    """
    def __init__(self):
        # Load C++ Tree-sitter Parser
        self.cpp_lang = Language(tscpp.language())
        self.parser = Parser(self.cpp_lang)
        self.primitive_types = {"int", "double", "float", "char", "bool", "string", "long", "size_t"}

    def instrument(self, source_code: str) -> str:
        """
        Instruments C++ source code string using AST traversal and offset-based splicing.
        """
        source_bytes = bytearray(source_code.encode("utf8"))
        tree = self.parser.parse(source_bytes)
        
        primitive_vars = set()
        statements = []
        
        # Traverse AST to collect variables and statements
        self._traverse(tree.root_node, primitive_vars, statements, inside_function=False)
        
        insertions = []
        for stmt in statements:
            line = stmt.start_point[0] + 1
            # Prepend line hit tracker
            insertions.append((stmt.start_byte, f"__trace_line({line}); "))
            
            # If not a return statement, check for primitive assignments to trace variables
            if stmt.type != "return_statement":
                var_name = self._get_assigned_variable(stmt, primitive_vars)
                if var_name:
                    # Append variable trace tracker immediately after statement ends (after semicolon)
                    insertions.append((stmt.end_byte, f" __trace_var({line}, \"{var_name}\", {var_name});"))
                    
        # Apply offset insertions from end-of-file to start to prevent offset shifting
        insertions.sort(key=lambda x: x[0], reverse=True)
        for offset, text in insertions:
            source_bytes[offset:offset] = text.encode("utf8")
            
        # Prepend preamble at start of file
        instrumented_code = CPP_PREAMBLE + source_bytes.decode("utf8")
        return instrumented_code

    def _find_type_token(self, node) -> str | None:
        """Helper to recursively scan declaration children for type identifier name."""
        if node.type in ("primitive_type", "type_identifier"):
            return node.text.decode("utf8")
        for child in node.children:
            res = self._find_type_token(child)
            if res:
                return res
        return None

    def _traverse(self, node, primitive_vars, statements, inside_function=False):
        """Recursively walks AST to extract primitive declarations and executable statements."""
        is_func = node.type == "function_definition"
        in_func = inside_function or is_func
        
        # 1. Collect primitive variable names globally (declaration, field_declaration, parameter_declaration)
        if node.type in ("declaration", "field_declaration", "parameter_declaration"):
            type_token = self._find_type_token(node)
            if type_token in self.primitive_types:
                def find_vars(n):
                    if n.type in ("identifier", "field_identifier"):
                        primitive_vars.add(n.text.decode("utf8"))
                    for child in n.children:
                        find_vars(child)
                find_vars(node)
                
        # 2. Collect target executable statements inside function definitions
        if in_func and not is_func:
            if node.type in ("expression_statement", "declaration", "return_statement"):
                # Exclude statements that are part of loop/conditional headers
                if node.parent and node.parent.type not in ("for_statement", "for_range_loop", "while_statement", "if_statement", "else_clause"):
                    statements.append(node)
                    return  # Do not traverse into children of instrumented statements
                    
        for child in node.children:
            self._traverse(child, primitive_vars, statements, in_func)

    def _get_assigned_variable(self, node, primitive_vars):
        """Traverses a statement node to check if it assigns/updates a tracked primitive variable."""
        if node.type == "assignment_expression":
            lhs = node.child(0)
            if lhs and lhs.type == "identifier":
                name = lhs.text.decode("utf8")
                if name in primitive_vars:
                    return name
        elif node.type == "init_declarator":
            declarator = node.child_by_field_name("declarator")
            if declarator and declarator.type == "identifier":
                name = declarator.text.decode("utf8")
                if name in primitive_vars:
                    return name
        elif node.type == "update_expression":
            for child in node.children:
                if child.type == "identifier":
                    name = child.text.decode("utf8")
                    if name in primitive_vars:
                        return name
                        
        for child in node.children:
            res = self._get_assigned_variable(child, primitive_vars)
            if res:
                return res
        return None
