import React, { useState } from 'react';
import { Button, message, Pagination, Modal } from 'antd';
import { IngestionSourceBuilderModal } from './source/builder/IngestionSourceBuilderModal';
import { Message } from '../shared/Message';
import {
  useListIngestionSourcesQuery,
  useDeleteIngestionSourceMutation,
  useCreateIngestionExecutionRequestMutation,
  useUpdateIngestionSourceMutation,
  useCreateIngestionSourceMutation
} from '../../graphql/ingestion.generated';
import {
  sourceTypeToIconUrl,
} from './source/utils';
import { IngestionSourceExecutionList } from './source/IngestionSourceExecutionList';
import { DEFAULT_EXECUTOR_ID, SourceBuilderState } from './source/builder/types';
import { UpdateIngestionSourceInput } from '../../types.generated';

const DEFAULT_PAGE_SIZE = 25;

const removeExecutionsFromIngestionSource = (source) => {
    if (source) {
        return {
            name: source.name,
            type: source.type,
            schedule: source.schedule,
            config: source.config,
        };
    }
    return undefined;
};

export const DataListPage = () => {
    const [page, setPage] = useState(1);
    const pageSize = DEFAULT_PAGE_SIZE;
    const start = (page - 1) * pageSize;

    // 声明选中数据源对象
    const [detailVisible, setDetailVisible] = useState(false)
    const [currentSource, setCurrentSource] = useState(() => {
      return {
        urn: '',
        name: ''
      }
    })

    const [isBuildingSource, setIsBuildingSource] = useState<boolean>(false);
    const [focusSourceUrn, setFocusSourceUrn] = useState<undefined | string>(undefined);
    const [lastRefresh, setLastRefresh] = useState(0);
    // Set of removed urns used to account for eventual consistency
    const [removedUrns, setRemovedUrns] = useState<string[]>([]);

    // Ingestion Source Queries
    const { loading, error, data, refetch } = useListIngestionSourcesQuery({
        variables: {
            input: {
                start,
                count: pageSize,
            },
        },
    });
    const [createIngestionSource] = useCreateIngestionSourceMutation();
    const [updateIngestionSource] = useUpdateIngestionSourceMutation();

    // // Execution Request queries
    const [createExecutionRequestMutation] = useCreateIngestionExecutionRequestMutation();
    const [removeIngestionSourceMutation] = useDeleteIngestionSourceMutation();

    const totalSources = data?.listIngestionSources?.total || 0;
    const sources = data?.listIngestionSources?.ingestionSources || [];
    const filteredSources = sources.filter((user) => !removedUrns.includes(user.urn));
    const focusSource =
        (focusSourceUrn && filteredSources.find((source) => source.urn === focusSourceUrn)) || undefined;

    const onCreateOrUpdateIngestionSourceSuccess = () => {
        setTimeout(() => refetch(), 2000);
        setIsBuildingSource(false);
        setFocusSourceUrn(undefined);
    };

    const createOrUpdateIngestionSource = (input: UpdateIngestionSourceInput, resetState: () => void) => {
        if (focusSourceUrn) {
            // Update:
            updateIngestionSource({ variables: { urn: focusSourceUrn as string, input } })
                .then(() => {
                    message.success({
                        content: `Successfully updated ingestion source!`,
                        duration: 3,
                    });
                    onCreateOrUpdateIngestionSourceSuccess();
                    resetState();
                })
                .catch((e) => {
                    message.destroy();
                    message.error({
                        content: `Failed to update ingestion source!: \n ${e.message || ''}`,
                        duration: 3,
                    });
                });
        } else {
            // Create
            createIngestionSource({ variables: { input } })
                .then(() => {
                    setTimeout(() => refetch(), 2000);
                    setIsBuildingSource(false);
                    setFocusSourceUrn(undefined);
                    resetState();
                    message.success({
                        content: `Successfully created ingestion source!`,
                        duration: 3,
                    });
                    // onCreateOrUpdateIngestionSourceSuccess();
                })
                .catch((e) => {
                    message.destroy();
                    message.error({
                        content: `Failed to create ingestion source!: \n ${e.message || ''}`,
                        duration: 3,
                    });
                });
        }
    };

    const onChangePage = (newPage: number) => {
        setPage(newPage);
    };

    const onRefresh = () => {
        refetch();
        // Used to force a re-render of the child execution request list.
        setLastRefresh(new Date().getMilliseconds());
    };

    const executeIngestionSource = (urn: string) => {
        createExecutionRequestMutation({
            variables: {
                input: {
                    ingestionSourceUrn: urn,
                },
            },
        })
            .then(() => {
                message.success({
                    content: `Successfully submitted ingestion execution request!`,
                    duration: 3,
                });
                setInterval(() => onRefresh(), 3000);
            })
            .catch((e) => {
                message.destroy();
                message.error({
                    content: `Failed to submit ingestion execution request!: \n ${e.message || ''}`,
                    duration: 3,
                });
            });
    };

    const deleteIngestionSource = async (urn: string) => {
        removeIngestionSourceMutation({
            variables: { urn },
        })
            .then(() => {
                message.success({ content: 'Removed ingestion source.', duration: 2 });
                const newRemovedUrns = [...removedUrns, urn];
                setRemovedUrns(newRemovedUrns);
                setTimeout(function () {
                    refetch?.();
                }, 3000);
            })
            .catch((e: unknown) => {
                message.destroy();
                if (e instanceof Error) {
                    message.error({ content: `Failed to remove ingestion source: \n ${e.message || ''}`, duration: 3 });
                }
            });
    };

    const onSubmit = (recipeBuilderState: SourceBuilderState, resetState: () => void) => {
        createOrUpdateIngestionSource(
            {
                type: recipeBuilderState.type as string,
                name: recipeBuilderState.name as string,
                config: {
                    recipe: recipeBuilderState.config?.recipe as string,
                    version:
                        (recipeBuilderState.config?.version?.length &&
                            (recipeBuilderState.config?.version as string)) ||
                        undefined,
                    executorId:
                        (recipeBuilderState.config?.executorId?.length &&
                            (recipeBuilderState.config?.executorId as string)) ||
                        DEFAULT_EXECUTOR_ID,
                },
                schedule: recipeBuilderState.schedule && {
                    interval: recipeBuilderState.schedule?.interval as string,
                    timezone: recipeBuilderState.schedule?.timezone as string,
                },
            },
            resetState,
        );
    };

    const onEdit = (urn: string) => {
        setIsBuildingSource(true);
        setFocusSourceUrn(urn);
    };

    const onViewRecord = (source) => {
      setCurrentSource(source)
      setDetailVisible(true)
    }

    const onExecute = (urn: string) => {
        Modal.confirm({
            title: `提示`,
            content: "点击确定，立即进行一次执行？",
            onOk() {
                executeIngestionSource(urn);
            },
            onCancel() {},
            cancelText: '取消',
            okText: '确认',
            maskClosable: true,
            closable: true,
            className: 'datalist-modal'
        });
    };

    const onDelete = (urn: string) => {
        Modal.confirm({
            title: `提示`,
            content: `删除任务会终止运行中的任务，确认删除？`,
            onOk() {
                deleteIngestionSource(urn);
            },
            onCancel() {},
            cancelText: '取消',
            okText: '确认',
            maskClosable: true,
            closable: true,
            className: 'datalist-modal'
        });
    };

    const onCancel = () => {
        setIsBuildingSource(false);
        setFocusSourceUrn(undefined);
    };

    // const tableData = filteredSources?.map((source) => ({
    //     urn: source.urn,
    //     type: source.type,
    //     name: source.name,
    //     schedule: source.schedule?.interval,
    //     timezone: source.schedule?.timezone,
    //     execCount: source.executions?.total || 0,
    //     lastExecTime:
    //         source.executions?.total &&
    //         source.executions?.total > 0 &&
    //         source.executions?.executionRequests[0].result?.startTimeMs,
    //     lastExecStatus:
    //         source.executions?.total &&
    //         source.executions?.total > 0 &&
    //         source.executions?.executionRequests[0].result?.status,
    // }));

  return (
    <>
      {!data && loading && <Message type="loading" content="Loading ingestion sources..." />}
            {error &&
                message.error({ content: `Failed to load ingestion sources! \n ${error.message || ''}`, duration: 3 })}
      <div className="datalist-page">
        <div className="datalist-page-title">
          <span className="title">数据源中心</span>

          <Button type="primary" ghost onClick={() => setIsBuildingSource(true)}>新增数据源</Button>
        </div>

        <div className="datalist-page-table">
          {
            sources.map((source:any) => {
              let lastExeDate = ''
              const time = source.executions?.total &&
                source.executions?.total > 0 &&
                source.executions?.executionRequests[0].result?.startTimeMs

              if(time) {
                const executionDate = new Date(time)
                lastExeDate = `${executionDate.toLocaleDateString()} ${executionDate.toLocaleTimeString()}`
              }

              const { type } = source
              const iconImage = sourceTypeToIconUrl(type);

              return <div className="table-card">
                <div className="card-info">
                  <div className="card-info-item">
                    <span className="card-info-item-name">{ source.name }</span>
                    <span>执行次数 {source?.executions?.total}次</span>
                  </div>

                  <div className="card-info-item">
                    <span>最近执行时间 {
                      lastExeDate
                    }</span>
                    <span>最近执行状态 {
                      source.executions?.total &&
                      source.executions?.total > 0 &&
                      source.executions?.executionRequests[0].result?.status
                    }</span>
                  </div>
                </div>

                <div className="card-icon">
                  {
                   (iconImage && <img className="image" src={iconImage} alt="" />) || <span className="custom">Custom</span>
                  }
                  
                </div>

                <div className="card-operates">
                  <Button type="primary" ghost onClick={() => onDelete(source.urn)}>删除</Button>
                  <Button type="primary"
                          ghost
                          disabled={source.lastExecStatus === 'RUNNING'}
                          onClick={() => onExecute(source.urn)}
                        >执行</Button>
                  <Button type="primary" ghost onClick={() => onViewRecord(source)}>记录</Button>
                  <Button type="primary" ghost onClick={() => onEdit(source.urn)}>编辑</Button>
                </div>
              </div>
            })
          }
          
        </div>

        <Pagination
            className='datalist-page-pagination'
            style={{ margin: 16, textAlign: 'center' }}
            current={page}
            pageSize={pageSize}
            total={totalSources}
            size="small"
            showLessItems
            onChange={onChangePage}
        />

        <Modal
          title={currentSource.name}
          visible={ detailVisible }
          onOk={() => setDetailVisible(false)}
          onCancel={() => setDetailVisible(false)}
          okText="确认"
          cancelText="取消"
          width="70%"
          className="dark-modal"
          footer={null}
        >
          <IngestionSourceExecutionList
            urn={currentSource.urn}
            lastRefresh={lastRefresh}
            onRefresh={onRefresh}
          />
        </Modal>

        <IngestionSourceBuilderModal
                initialState={removeExecutionsFromIngestionSource(focusSource)}
                visible={isBuildingSource}
                onSubmit={onSubmit}
                onCancel={onCancel}
            />
      </div>
    </>
  );
};
