import React, { useState } from 'react';
import { message, Modal, Button, Form, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useGetAuthenticatedUser } from '../../../../useGetAuthenticatedUser';

import { GenericEntityUpdate } from '../../types';
import { useEntityData, useEntityUpdate } from '../../EntityContext';

export const AddLinkModal = ({ buttonProps }: { buttonProps?: Record<string, unknown> }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const user = useGetAuthenticatedUser();
    const { urn, entityData } = useEntityData();
    const updateEntity = useEntityUpdate<GenericEntityUpdate>();

    const [form] = Form.useForm();

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleClose = () => {
        form.resetFields();
        setIsModalVisible(false);
    };

    const handleAdd = async (formData: any) => {
        if (user?.corpUser.urn) {
            const links = entityData?.institutionalMemory?.elements || [];

            const newLinks = links.map((link) => {
                return {
                    author: link.author.urn,
                    url: link.url,
                    description: link.description,
                    createdAt: link.created.time,
                };
            });

            newLinks.push({
                author: user?.corpUser.urn,
                createdAt: Date.now(),
                ...formData,
            });

            try {
                await updateEntity({
                    variables: { input: { urn, institutionalMemory: { elements: newLinks } } },
                });
                message.success({ content: '链接添加成功!', duration: 2 });
            } catch (e: unknown) {
                message.destroy();
                if (e instanceof Error) {
                    message.error({ content: `链接添加失败: \n ${e.message || ''}`, duration: 3 });
                }
            }

            handleClose();
        } else {
            message.error({ content: `Error adding link: no user`, duration: 2 });
        }
    };

    return (
        <>
            <Button icon={<PlusOutlined />} onClick={showModal} {...buttonProps}>
                添加链接
            </Button>
            <Modal
                title="添加链接"
                visible={isModalVisible}
                destroyOnClose
                onCancel={handleClose}
                footer={[
                    <Button type="text" onClick={handleClose}>
                        取消
                    </Button>,
                    <Button form="addLinkForm" key="submit" htmlType="submit">
                        添加
                    </Button>,
                ]}
            >
                <Form form={form} name="addLinkForm" onFinish={handleAdd} layout="vertical">
                    <Form.Item
                        name="url"
                        label="链接地址"
                        rules={[
                            {
                                required: true,
                                message: '请输入一个链接地址.',
                            },
                            {
                                type: 'url',
                                message: '请输入一个有效的链接地址.',
                            },
                        ]}
                    >
                        <Input placeholder="https://" autoFocus />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="标签"
                        rules={[
                            {
                                required: true,
                                message: '请输入一个标签.',
                            },
                        ]}
                    >
                        <Input placeholder="此链接的简短标签" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
