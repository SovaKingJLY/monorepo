import styles from './left.module.less'
import { Input, Tooltip, Button, Divider, Form, Slider, Skeleton, Modal } from 'antd'
import { GithubOutlined, MailOutlined, MoonOutlined } from '@ant-design/icons'
import Icon from '../../icon/Icon'
import useDarkStore from '../../../store/darkMode'
import ButtonList from '../../buttonList/buttonList'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import useUserStore from '../../../store/user'
import { useEffect, useState } from 'react'
import useTextFontSize from '../../../store/state/textFontSize'
import { logoutAdmin } from '../../../api/http/api'

interface formType {
    keyword: string,
}
interface leftProp {
    text: Text[]
}
export default function Left(prop: leftProp) {
    const UserStore = useUserStore();
    const location = useLocation();
    const [textFontSize, setTextFontSize] = useState(1);
    const textFontSizeStore = useTextFontSize();
    const nav = useNavigate();
    const [form] = Form.useForm();
    let darkStore = useDarkStore();
    const [param] = useSearchParams();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        form.setFieldsValue({ keyword: param.get("keyword") });
    }, [param.get("keyword")]);
    useEffect(() => {
        textFontSizeStore.setFontSize(String(textFontSize));
    }, [textFontSize])
    const toDark = () => {
        darkStore.updateDark();
    }
    const jump = () => nav('/');
    const validateKeyword = (_: any, keyword: string): Promise<void> => {
        if (!keyword?.trim()) return Promise.reject(new Error('请输入文字'));
        else return Promise.resolve();
    }
    const onFinish = async () => {
        nav(`/search/?keyword=${form.getFieldValue('keyword')}`);
    }
    const logout = async () => {
        showModal();
    }
    const scrollTop = () => {
        window.scrollTo({
            top: 0,        // 要滑动到的位置
            behavior: "smooth"  // 平滑滚动
        });
    }
    const set = new Set;
    prop.text.forEach((item) => {
        set.add(item.tag);
    })

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = async () => {
        setOpen(false);
        try {
            await logoutAdmin();
            UserStore.logout();
        } catch (e) {

        }
    };

    const handleCancel = () => {
        setOpen(false);
    };
    return <>
        <nav className={styles.wrapper}>
            <div className={styles.upWrapper}>
                {UserStore.isLoading ? <Skeleton.Avatar size={200}
                    shape="circle" >
                </Skeleton.Avatar> : ''}
                <Skeleton paragraph={{ rows: 6 }} loading={UserStore.isLoading}>
                    <img className={styles.avatar} src='https://redsources.jlyproject.cn/20a8608b-2567-4d5a-984b-b0f0d9ac579b.jpg?imageMogr2/format/webp' />
                    <div onClick={jump} className={styles.title}>
                        JLY Blog
                    </div>
                    <Skeleton loading={!Boolean(prop.text.length)}>
                        <div className={styles.sum}>
                            {prop.text.length}篇文档<Divider type="vertical" />{set.size}个专题
                        </div>
                    </Skeleton>

                    <div className={styles.btn}>
                        <Tooltip title="2631854038@qq.com">
                            <Button type="primary" shape="circle" icon={<MailOutlined />} />
                        </Tooltip>
                        <Tooltip title="github.com/zjcxJXUCM2021">
                            <Button type="primary" shape="circle" icon={<GithubOutlined />} />
                        </Tooltip>
                        <Tooltip title="黑夜模式">
                            <Button type="primary" shape="circle" icon={<MoonOutlined />} onClick={toDark} />
                        </Tooltip>
                    </div>

                    <Divider size='small' />
                    <div className={styles.support}>
                        <Icon type='icon-react1'></Icon>
                        <Icon type='icon-tengxunyun2'></Icon>
                        <Icon type='icon-qiniuyuncunchu'></Icon>
                    </div>
                </Skeleton>

            </div>
            <div className={styles.downWrapper} >

                <Skeleton loading={UserStore.isLoading} paragraph={{ rows: 4 }}>
                    <>
                        {
                            UserStore.accessToken ?
                                <>
                                    {UserStore.role == '管理员' ? <><ButtonList path='/admin/upload/' >上传</ButtonList></> : ''}
                                    <div onClick={() => { logout() }} style={{ width: "100%" }}>
                                        <ButtonList >注销</ButtonList>
                                    </div>
                                </>
                                : <ButtonList path='/login/' >登录</ButtonList>
                        }

                        < ButtonList path='/' >首页</ButtonList >
                        <div style={{ width: "100%" }} onClick={scrollTop}><ButtonList>回到顶部</ButtonList></div>
                        <Form
                            form={form}
                            name="log"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 24 }}
                            style={{}}
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            autoComplete="off"
                        ><Form.Item<formType>
                            name="keyword"
                            rules={[{ required: false, validator: validateKeyword }]}
                        >
                                <Input placeholder='搜索文章' />
                            </Form.Item></Form>
                        {
                            location.pathname.slice(0, 5) == '/text' ? <div style={{ width: '100%' }}>
                                字体大小
                                <Slider value={textFontSize} onChange={(value) => setTextFontSize(value)} max={3} min={0.5} step={0.1} />
                            </div> : ''
                        }
                    </>
                </Skeleton>
            </div>

        </nav >

        <Modal
            open={open}
            title="提示"
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
                <Button key="submit" type="primary" onClick={handleOk}>
                    确定
                </Button>,
                <Button key="back" onClick={handleCancel}>
                    取消
                </Button>
            ]}
        >
            确定注销吗
        </Modal>
    </>
}