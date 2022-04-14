import { SourceConfig } from '../types';
import clickhouseLogo from '../../../../../images/clickhouselogo.svg';
import icon from '../../../../../images/clickHouse.png'


const baseUrl = window.location.origin;

const placeholderRecipe = `\
source: 
    type: clickhouse
    config: 
        # Coordinates
        host_port: # Your Clickhouse host and post, e.g. clickhouse:3306
        database: # Your Clickhouse database name, e.g. datahub
    
        # Credentials
        username: # Your Clickhouse username, e.g. admin
        password: # Your Clickhouse password, e.g. password_01

        # Options
        include_tables: True
        include_views: True

        # Profiling
        profiling:
            enabled: false
sink: 
    type: datahub-rest 
    config: 
        server: "${baseUrl}/api/gms"`;

const clickhouseConfig: SourceConfig = {
    type: 'clickhouse',
    placeholderRecipe,
    displayName: 'Clickhouse',
    logoUrl: clickhouseLogo,
    icon
};

export default clickhouseConfig;
