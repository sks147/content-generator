Architecture

├── infra ## holds all code/scripts related to deployments and infrastructure management
│   ├── ...
│   ├── docker-compose-prod.yml
│   └── docker-compose.yml
├── py_root ## holds code for mcp servers written in python
│   └── mcp_servers
└── ts_root
    ├── backend ## backend apis
    ├── frontend ## frontend 
    ├── mcp_servers ## mcp servers
    ├── shared ## shared code to be used in all other directories in ts_root
    └── temporal ## for managing temporal workloads (long running jobs)