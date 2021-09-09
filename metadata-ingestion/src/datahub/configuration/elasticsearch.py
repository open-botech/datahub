import re

from pydantic import Field, validator

from datahub.configuration.common import ConfigModel


class ElasticsearchConnectionConfig(ConfigModel):
    # elasticsearch host
    host: str = "localhost:9092"
    username: str
    password: str

    @validator("host")
    def host_colon_port_comma(cls, val: str) -> str:
        for entry in val.split(","):
            # The port can be provided but is not required.
            port = None
            if ":" in entry:
                (host, port) = entry.rsplit(":", 1)
            else:
                host = entry
            assert re.match(
                # This regex is quite loose. Many invalid hostnames or IPs will slip through,
                # but it serves as a good first line of validation. We defer to Kafka for the
                # remaining validation.
                r"^[\w\-\.\:]+$",
                host,
            ), f"host contains bad characters, found {host}"
            if port is not None:
                assert port.isdigit(), f"port must be all digits, found {port}"
        return val
