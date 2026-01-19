import { useEffect, useRef, useState } from 'react';
import styles from './upload.module.less';
import { Editor } from '@tinymce/tinymce-react';
import { Form, Button, Input, Modal, AutoComplete, App, Card, Row, Col, Space } from 'antd';
import { getTags, getText, updateText, uploadText } from '../../api/http/api';
import axios from 'axios';
import { useBlocker, useNavigate, useSearchParams } from 'react-router';
import useDarkStore from '../../store/darkMode';

interface FieldType {
    title: string;
    tag: string;
}
interface searchTag {
    value: string;
    label: string;
}

export default function Upload() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const editorRef = useRef<any>(null);
    const [form] = Form.useForm();
    const nav = useNavigate();
    const [param] = useSearchParams();
    const [content, setContent] = useState('');
    const id = param.get('id');
    const [options, setOptions] = useState<searchTag[]>([]);
    const { isDark } = useDarkStore();
    const { message } = App.useApp();
    const skin = isDark ? "oxide-dark" : "oxide";
    const contentCss = isDark ? "dark" : "default";
    const [tags, setTags] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    // 路由拦截逻辑保持不变
    const blocker = useBlocker(
        ({ historyAction }) => {
            if (historyAction !== 'POP') {
                return false;
            }
            showModal();
            return true;
        }
    );

    useEffect(() => {
        document.title = id ? "编辑文档" : "上传文档"; // 优化标题逻辑
        const init = async () => {
            if (id) {
                try {
                    const res = await getText(Number(id));
                    setContent(res.content);
                    form.setFieldsValue({
                        title: res.title,
                        tag: res.tag
                    });
                } catch { }
            }
            try {
                setTags(await getTags());
            } catch { }
        };
        init();
    }, [id, form]);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => {
            window.removeEventListener("beforeunload", handler);
        };
    }, []);

    const onFinish = async (value: FieldType) => {
        if (!editorRef.current) return;

        const currentContent = editorRef.current.getContent();
        // 简单校验一下内容是否为空
        if (!currentContent || currentContent.trim() === '') {
            message.warning('请输入文章内容');
            return;
        }

        try {
            setUploading(true);
            message.info({ key: "upload", content: "上传中" });
            const payload = {
                id: id ? Number(id) : 0,
                content: currentContent,
                title: value.title,
                tag: value.tag,
            } as Text; // 假设 Text 类型定义在全局或导入

            let resId;
            if (!id) {
                resId = await uploadText(payload);
            } else {
                await updateText(payload);
                resId = id;
            }

            message.success({ key: "upload", content: "保存成功", duration: 2 });
            // 只有成功才跳转，并把 loading 状态解除
            nav(`/text/${resId}`);
        } catch (error) {
            setUploading(false);
            message.error({ key: "upload", content: "保存失败" });
        }
    };

    const onFinishFailed = async () => {
        message.error("请检查必填项");
    };

    const handleImageUpload = (blobInfo: any, progress: (percent: number) => void) => {
        return new Promise<string>((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', blobInfo.blob(), blobInfo.filename());
            // 使用配置好的代理路径 /api
            axios.post('/api/upload/photo/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    if (e.total) {
                        progress((e.loaded / e.total) * 100);
                    }
                }
            }).then(response => {
                const data = response.data.data.location;
                if (typeof data === 'string') resolve(data);
                else if (data && data.url) resolve(data.url);
                else if (data && data.data) resolve(data.data);
                else reject('无法解析图片地址');
            }).catch(err => {
                reject('图片上传失败: ' + (err.message || err));
            });
        });
    };

    const showModal = () => setIsModalOpen(true);
    const handleOk = () => {
        blocker.proceed?.();
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        blocker.reset?.();
        setIsModalOpen(false);
    };

    const onSearch = (keyword: string) => {
        if (!tags) return;
        const newOptions = tags
            .filter(item => item.toLowerCase().includes(keyword.toLowerCase()))
            .map(item => ({ value: item, label: item }));
        setOptions(newOptions);
    };

    return (
        <>
            <div className={styles.wrapper}>
                {/* 使用 Card 包裹，提升质感 */}
                <Card
                    className={styles.uploadCard}
                    bordered={false}
                    title={id ? "编辑文章" : "撰写新文章"}
                >
                    <Form
                        form={form}
                        name="upload-form"
                        layout='vertical'
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        initialValues={{ remember: true }}
                    >
                        {/* 使用 Row Col 布局，让输入框在一行显示 */}
                        <Row gutter={24}>
                            <Col xs={24} md={8}>
                                <Form.Item<FieldType>
                                    label="章节 / 标签"
                                    name="tag"
                                    rules={[{ required: true, message: '请输入或选择章节' }]}
                                >
                                    <AutoComplete
                                        options={options}
                                        onSearch={onSearch}
                                        placeholder="输入或选择章节"
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={16}>
                                <Form.Item<FieldType>
                                    label="文章标题"
                                    name="title"
                                    rules={[{ required: true, message: '请输入标题' }]}
                                >
                                    <Input placeholder='请输入文章标题' />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item>
                            <div className={styles.editorWrapper}>
                                <Editor
                                    tinymceScriptSrc='/tinymce/tinymce.min.js'
                                    licenseKey='gpl'
                                    onInit={(_evt, editor) => editorRef.current = editor}
                                    initialValue={content}
                                    init={{
                                        skin: skin,
                                        content_css: contentCss,
                                        height: 600, // 这里用数字即可
                                        menubar: true, // 建议开启菜单栏，方便找功能
                                        plugins: [
                                            // 1. 在这里加入 codesample
                                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                            'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount',
                                            'codesample'
                                        ],
                                        toolbar:
                                            'undo redo | blocks | ' +
                                            'bold italic forecolor | alignleft aligncenter ' +
                                            'alignright alignjustify | bullist numlist outdent indent | ' +
                                            // 2. 在工具栏加入 codesample 按钮
                                            'image codesample | removeformat | help',
                                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }', // 字体调大一点点更舒服

                                        // 图片上传配置
                                        images_upload_handler: handleImageUpload,
                                        automatic_uploads: true,
                                        paste_data_images: true,

                                        // 代码块配置 (可选: 定义默认代码语言)
                                        codesample_languages: [
                                            { text: 'HTML/XML', value: 'markup' },
                                            { text: 'JavaScript', value: 'javascript' },
                                            { text: 'CSS', value: 'css' },
                                            { text: 'TypeScript', value: 'typescript' },
                                            { text: 'Java', value: 'java' },
                                            { text: 'C++', value: 'cpp' },
                                            { text: 'Python', value: 'python' },
                                            { text: 'C', value: 'c' },
                                            { text: 'C#', value: 'csharp' },
                                        ]
                                    }}
                                />
                            </div>
                        </Form.Item>

                        <Form.Item>
                            <div className={styles.btnWrapper}>
                                <Space size="large">
                                    <Button onClick={() => nav(-1)}>取消</Button>
                                    <Button type="primary" htmlType="submit" loading={uploading} size='large'>
                                        {id ? "保存修改" : "发布"}
                                    </Button>
                                </Space>
                            </div>
                        </Form.Item>
                    </Form>
                </Card>
            </div>

            <Modal
                title="未保存提示"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="离开"
                cancelText="继续编辑"
                centered // 垂直居中显示
            >
                <p>您有内容尚未保存，确定要离开当前页面吗？离开后内容将丢失。</p>
            </Modal>
        </>
    );
}