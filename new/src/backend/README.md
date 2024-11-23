# Atomic Charge Calculator II

## Manual Setup

### Prerequisites
ACC II depends on the [ChargeFW2](https://github.com/sb-ncbr/ChargeFW2) python bindings. 

#### [Building ChargeFW2](https://github.com/sb-ncbr/ChargeFW2/tree/master?tab=readme-ov-file#installation)

*Note:* When running `cmake`, include `-DPYTHON_MODULE=ON` to generete python bindings:

```bash
$ cmake .. -DCMAKE_INSTALL_PREFIX=<WHERE-TO-INSTALL> -DPYTHON_MODULE=ON
```

#### [Using Python Bindings](https://github.com/sb-ncbr/ChargeFW2/blob/master/doc/ChargeFW2%20-%20tutorial.ipynb)

*Note:* `PYTHONPATH` environment variable is set in `app/.env` file. Overwrite it if you wish to install ChargeFW2 somewhere else.

### Installing Dependencies
ACC II uses [Poetry](https://python-poetry.org/) for depencency management.

#### Install Poetry
```bash
$ curl -sSL https://install.python-poetry.org | python3 -
```

#### Install Project Dependencies
*Note:* Poetry will automatically create a virtual environment inside the project before the installation.

```bash
$ poetry install
```

### Startup
Application can now be started just by running the main file:

```bash
$ poetry run python app/main.py
```

Application runs by default on `localhost:8000`. Documentation (Swagger) is available on `localhost:8000/docs`.
