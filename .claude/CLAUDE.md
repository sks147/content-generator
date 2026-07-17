## How to write code
- Use pinned dependencies everywhere
- Modular code
- Separate files for separate react components
- Good file structure for react project
- Code has low cyclomatic complexity (minimal nesting level, early returns, named booleans)
- Code follows best functional coding patterns
- Errors and edge cases handled
- No secrets or credentials hardcoded
- Logging added where appropriate
- Strict schema validations

## Agent Routing

- For backend nodejs code 
-> Directories: `ts_root/backend`, `ts_root/mcp_servers`, `ts_root/shared`, `ts_root/temporal` directories
-> nodejs-dev agent for exploration, coding, bug-fixes

- For frontend react code 
-> Directories: `ts_root/frontend`
-> react-dev agent for exploration, coding, bug-fixes


- For python code
-> Directories: `py_root/`
-> python-dev agent for exploration, coding, bug-fixes