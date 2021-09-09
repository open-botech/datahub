import re

from pydantic import validator

from datahub.configuration.common import ConfigModel


class ElasticsearchConnectionConfig(ConfigModel):
    # elasticsearch host
    host: str = "localhost:9092"
