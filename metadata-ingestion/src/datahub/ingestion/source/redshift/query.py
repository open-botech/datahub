from datetime import datetime

from datahub.ingestion.source.sql.redshift import redshift_datetime_format


class RedshiftQuery:
    list_databases: str = """SELECT datname FROM pg_database
        WHERE (datname <> ('padb_harvest')::name)
        AND (datname <> ('template0')::name)
        AND (datname <> ('template1')::name)
        """

    list_schemas: str = """SELECT database_name,
        schema_name,
        schema_type,
        usename as schema_owner_name,
        schema_option,
        NULL::varchar(255) as external_database
        FROM SVV_REDSHIFT_SCHEMAS as s
        inner join pg_catalog.pg_user_info as i on i.usesysid = s.schema_owner
        where schema_name !~ '^pg_'
        AND   schema_name != 'information_schema'
UNION ALL
SELECT null as database_name,
        schemaname as schema_name,
        CASE s.eskind
            WHEN '1' THEN 'GLUE'
            WHEN '2' THEN 'HIVE'
            WHEN '3' THEN 'POSTGRES'
            WHEN '4' THEN 'REDSHIFT'
            ELSE 'OTHER'
        END as schema_type,
        usename as schema_owner_name,
        esoptions as schema_option,
        databasename as external_database
        FROM SVV_EXTERNAL_SCHEMAS as s
        inner join pg_catalog.pg_user_info as i on i.usesysid = s.esowner
        ORDER BY database_name,
            SCHEMA_NAME;
        """

    list_tables: str = """
 SELECT  CASE c.relkind
                WHEN 'r' THEN 'TABLE'
                WHEN 'v' THEN 'VIEW'
                WHEN 'm' THEN 'MATERIALIZED VIEW'
                WHEN 'f' THEN 'FOREIGN TABLE'
            END AS tabletype,
            n.oid AS "schema_oid",
            n.nspname AS "schema",
            c.oid AS "rel_oid",
            c.relname,
            ci.relcreationtime as creation_time,
            CASE c.reldiststyle
                WHEN 0 THEN 'EVEN'
                WHEN 1 THEN 'KEY'
                WHEN 8 THEN 'ALL'
            END AS "diststyle",
            c.relowner AS "owner_id",
            u.usename AS "owner_name",
            TRIM(TRAILING ';' FROM pg_catalog.pg_get_viewdef (c.oid,TRUE)) AS "view_definition",
            pg_catalog.array_to_string(c.relacl,'\n') AS "privileges",
            NULL as "location",
            NULL as parameters,
            NULL as input_format,
            NULL As output_format,
            NULL as serde_parameters,
            pgd.description as table_description
        FROM pg_catalog.pg_class c
        LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        LEFT JOIN pg_class_info as ci on c.oid = ci.reloid
        LEFT JOIN pg_catalog.pg_description pgd ON pgd.objsubid = 0 AND pgd.objoid = c.oid
        JOIN pg_catalog.pg_user u ON u.usesysid = c.relowner
        WHERE c.relkind IN ('r','v','m','S','f')
        AND   n.nspname !~ '^pg_'
        AND   n.nspname != 'information_schema'
        UNION
        SELECT 'EXTERNAL_TABLE' as tabletype,
            NULL AS "schema_oid",
            schemaname AS "schema",
            NULL AS "rel_oid",
            tablename AS "relname",
            NULL as "creation_time",
            NULL AS "diststyle",
            NULL AS "owner_id",
            NULL AS "owner_name",
            NULL AS "view_definition",
            NULL AS "privileges",
            "location",
            parameters,
            input_format,
            output_format,
            serde_parameters,
            NULL as table_description
        FROM pg_catalog.svv_external_tables
        ORDER BY "schema",
                "relname";
"""
    list_columns: str = """
            SELECT
              n.nspname as "schema",
              c.relname as "table_name",
              att.attname as "name",
              format_encoding(att.attencodingtype::integer) as "encode",
              format_type(att.atttypid, att.atttypmod) as "type",
              att.attisdistkey as "distkey",
              att.attsortkeyord as "sortkey",
              att.attnotnull as "notnull",
              pg_catalog.col_description(att.attrelid, att.attnum)
                as "comment",
              adsrc,
              attnum,
              pg_catalog.format_type(att.atttypid, att.atttypmod),
              pg_catalog.pg_get_expr(ad.adbin, ad.adrelid) as default,
              n.oid as "schema_oid",
              c.oid as "table_oid"
            FROM pg_catalog.pg_class c
            LEFT JOIN pg_catalog.pg_namespace n
              ON n.oid = c.relnamespace
            JOIN pg_catalog.pg_attribute att
              ON att.attrelid = c.oid
            LEFT JOIN pg_catalog.pg_attrdef ad
              ON (att.attrelid, att.attnum) = (ad.adrelid, ad.adnum)
            WHERE n.nspname !~ '^pg_'
              AND   n.nspname != 'information_schema'
              AND att.attnum > 0
              AND NOT att.attisdropped
              and schema = '{schema_name}'
            UNION
            SELECT
              view_schema as "schema",
              view_name as "table_name",
              col_name as "name",
              null as "encode",
              col_type as "type",
              null as "distkey",
              0 as "sortkey",
              null as "notnull",
              null as "comment",
              null as "adsrc",
              null as "attnum",
              col_type as "format_type",
              null as "default",
              null as "schema_oid",
              null as "table_oid"
            FROM pg_get_late_binding_view_cols() cols(
              view_schema name,
              view_name name,
              col_name name,
              col_type varchar,
              col_num int)
            WHERE 1 and schema = '{schema_name}'
            UNION
            SELECT
              schemaname as "schema",
              tablename as "table_name",
              columnname as "name",
              null as "encode",
              -- Spectrum represents data types differently.
              -- Standardize, so we can infer types.
              external_type AS "type",
              null as "distkey",
              0 as "sortkey",
              null as "notnull",
              null as "comment",
              null as "adsrc",
              null as "attnum",
              external_type AS "format_type",
              null as "default",
              null as "schema_oid",
              null as "table_oid"
            FROM SVV_EXTERNAL_COLUMNS
            WHERE 1 and schema = '{schema_name}'
            ORDER BY "schema", "table_name", "attnum"
"""

    additional_table_metadata: str = """
        select
            database,
            schema,
            "table",
            size,
            tbl_rows,
            estimated_visible_rows,
            skew_rows,
            last_accessed
        from
            pg_catalog.svv_table_info as ti
        left join (
            select
                tbl,
                max(endtime) as last_accessed
            from
                pg_catalog.stl_insert
            group by
                tbl) as la on
            (la.tbl = ti.table_id)
       ;
    """

    @staticmethod
    def stl_scan_based_lineage_query(
        db_name: str, start_time: datetime, end_time: datetime
    ) -> str:
        return """
                        select
                            distinct cluster,
                            target_schema,
                            target_table,
                            username as username,
                            source_schema,
                            source_table
                        from
                                (
                            select
                                distinct tbl as target_table_id,
                                sti.schema as target_schema,
                                sti.table as target_table,
                                sti.database as cluster,
                                query,
                                starttime
                            from
                                stl_insert
                            join SVV_TABLE_INFO sti on
                                sti.table_id = tbl
                            where starttime >= '{start_time}'
                            and starttime < '{end_time}'
                            and cluster = '{db_name}'
                                ) as target_tables
                        join ( (
                            select
                                sui.usename as username,
                                ss.tbl as source_table_id,
                                sti.schema as source_schema,
                                sti.table as source_table,
                                scan_type,
                                sq.query as query
                            from
                                (
                                select
                                    distinct userid,
                                    query,
                                    tbl,
                                    type as scan_type
                                from
                                    stl_scan
                            ) ss
                            join SVV_TABLE_INFO sti on
                                sti.table_id = ss.tbl
                            left join stl_query sq on
                                ss.query = sq.query
                            left join svl_user_info sui on
                                sq.userid = sui.usesysid
                            where
                                sui.usename <> 'rdsdb')
                        ) as source_tables
                                using (query)
                        where
                            scan_type in (1, 2, 3)
                        order by cluster, target_schema, target_table, starttime asc
                    """.format(
            # We need the original database name for filtering
            db_name=db_name,
            start_time=start_time.strftime(redshift_datetime_format),
            end_time=end_time.strftime(redshift_datetime_format),
        )

    @staticmethod
    def view_lineage_query() -> str:
        return """
                        select
                            distinct
                            srcnsp.nspname as source_schema
                            ,
                            srcobj.relname as source_table
                            ,
                            tgtnsp.nspname as target_schema
                            ,
                            tgtobj.relname as target_table
                        from
                            pg_catalog.pg_class as srcobj
                        inner join
                            pg_catalog.pg_depend as srcdep
                                on
                            srcobj.oid = srcdep.refobjid
                        inner join
                            pg_catalog.pg_depend as tgtdep
                                on
                            srcdep.objid = tgtdep.objid
                        join
                            pg_catalog.pg_class as tgtobj
                                on
                            tgtdep.refobjid = tgtobj.oid
                            and srcobj.oid <> tgtobj.oid
                        left outer join
                            pg_catalog.pg_namespace as srcnsp
                                on
                            srcobj.relnamespace = srcnsp.oid
                        left outer join
                            pg_catalog.pg_namespace tgtnsp
                                on
                            tgtobj.relnamespace = tgtnsp.oid
                        where
                            tgtdep.deptype = 'i'
                            --dependency_internal
                            and tgtobj.relkind = 'v'
                            --i=index, v=view, s=sequence
                            and tgtnsp.nspname not in ('pg_catalog', 'information_schema')
                            order by target_schema, target_table asc
                    """

    @staticmethod
    def list_late_view_ddls_query() -> str:
        return """
                SELECT
                    n.nspname AS target_schema
                    ,c.relname AS target_table
                    , COALESCE(pg_get_viewdef(c.oid, TRUE), '') AS ddl
                FROM
                    pg_catalog.pg_class AS c
                INNER JOIN
                    pg_catalog.pg_namespace AS n
                    ON c.relnamespace = n.oid
                WHERE relkind = 'v'
                and
                n.nspname not in ('pg_catalog', 'information_schema')
                """

    @staticmethod
    def list_unload_commands_sql(
        db_name: str, start_time: datetime, end_time: datetime
    ) -> str:
        return """
            select
                distinct
                    sti.database as cluster,
                    sti.schema as source_schema,
                    sti."table" as source_table,
                    unl.path as filename
            from
                stl_unload_log unl
            join stl_scan sc on
                sc.query = unl.query and
                sc.starttime >= '{start_time}' and
                sc.endtime < '{end_time}'
            join SVV_TABLE_INFO sti on
                sti.table_id = sc.tbl
            where
                unl.start_time >= '{start_time}' and
                unl.end_time < '{end_time}' and
                sti.database = '{db_name}'
              and sc.type in (1, 2, 3)
            order by cluster, source_schema, source_table, filename, unl.start_time asc
            """.format(
            # We need the original database name for filtering
            db_name=db_name,
            start_time=start_time.strftime(redshift_datetime_format),
            end_time=end_time.strftime(redshift_datetime_format),
        )

    @staticmethod
    def list_insert_create_queries_sql(
        db_name: str, start_time: datetime, end_time: datetime
    ) -> str:
        return """
                select
                    distinct cluster,
                    target_schema,
                    target_table,
                    username,
                    querytxt as ddl
                from
                        (
                    select
                        distinct tbl as target_table_id,
                        sti.schema as target_schema,
                        sti.table as target_table,
                        sti.database as cluster,
                        usename as username,
                        querytxt,
                        si.starttime as starttime
                    from
                        stl_insert as si
                    join SVV_TABLE_INFO sti on
                        sti.table_id = tbl
                    left join pg_user pu on
                        pu.usesysid = si.userid
                    left join stl_query sq on
                        si.query = sq.query
                    left join stl_load_commits slc on
                        slc.query = si.query
                    where
                        pu.usename <> 'rdsdb'
                        and sq.aborted = 0
                        and slc.query IS NULL
                        and cluster = '{db_name}'
                        and si.starttime >= '{start_time}'
                        and si.starttime < '{end_time}'
                    ) as target_tables
                    order by cluster, target_schema, target_table, starttime asc
                """.format(
            # We need the original database name for filtering
            db_name=db_name,
            start_time=start_time.strftime(redshift_datetime_format),
            end_time=end_time.strftime(redshift_datetime_format),
        )

    @staticmethod
    def list_copy_commands_sql(
        db_name: str, start_time: datetime, end_time: datetime
    ) -> str:
        return """
                select
                    distinct
                        "schema" as target_schema,
                        "table" as target_table,
                        filename
                from
                    stl_insert as si
                join stl_load_commits as c on
                    si.query = c.query
                join SVV_TABLE_INFO sti on
                    sti.table_id = tbl
                where
                    database = '{db_name}'
                    and si.starttime >= '{start_time}'
                    and si.starttime < '{end_time}'
                order by target_schema, target_table, starttime asc
                """.format(
            # We need the original database name for filtering
            db_name=db_name,
            start_time=start_time.strftime(redshift_datetime_format),
            end_time=end_time.strftime(redshift_datetime_format),
        )
