import React from 'react';
import { FormOutlined } from '@ant-design/icons';
import { ANTD_GRAY } from '../../../entity/shared/constants';
import bigqueryConfig from './bigquery/bigquery';
import redshiftConfig from './redshift/redshift';
import snowflakeConfig from './snowflake/snowflake';
import lookerConfig from './looker/looker';
import mysqlConfig from './mysql/mysql';
import postgresConfig from './postgres/postgres';
import kafkaConfig from './kafka/kafka';
import azureAdConfig from './azure/azure';
import glueConfig from './glue/glue';
import mongoConfig from './mongodb/mongodb';
import oktaConfig from './okta/okta';
import { SourceConfig } from './types';
import hiveConfig from './hive/hive';
import oracleConfig from './oracle/oracle';
import clickhouseConfig from './clickhouse/clickhouse';
import elasticsearchConfig from './elasticsearch/elasticsearch';
import dbtConfig from './dbt/dbt';
import metabaseConfig from './metabase/metabase';
import supersetConfig from './superset/superset';
import tableauConfig from './tableau/tableau';
import redashConfig from './redash/redash';
import s3Config from './s3/s3';
import fileConfig from './file/file';
import mssqlConfig from './mssql/mssql';


const baseUrl = window.location.origin;

const DEFAULT_PLACEHOLDER_RECIPE = `\
source:
  type: <source-type>
  config:
    # Source-type specifics config
    <source-configs> 

sink:
  type: datahub-rest
  config:
    server: "${baseUrl}/api/gms"`;

export const SOURCE_TEMPLATE_CONFIGS: Array<SourceConfig> = [
    bigqueryConfig,
    redshiftConfig,
    snowflakeConfig,
    kafkaConfig,
    lookerConfig,
    tableauConfig,
    mysqlConfig,
    postgresConfig,
    mongoConfig,
    azureAdConfig,
    oktaConfig,
    glueConfig,
    oracleConfig,
    hiveConfig,
    clickhouseConfig,
    elasticsearchConfig,
    dbtConfig,
    metabaseConfig,
    supersetConfig,
    redashConfig,
    s3Config,
    fileConfig,
    mssqlConfig,
    {
        type: 'custom',
        placeholderRecipe: DEFAULT_PLACEHOLDER_RECIPE,
        displayName: 'Custom',
        docsUrl: 'https://datahubproject.io/docs/metadata-ingestion/',
        logoComponent: <FormOutlined style={{ color: ANTD_GRAY[8], fontSize: 28 }} />,
    },
];
