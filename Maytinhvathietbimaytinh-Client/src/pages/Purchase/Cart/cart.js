import { CreditCardOutlined, DeleteOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Card, Col, Divider, Form, InputNumber, Layout, Row, Spin, Statistic, Table, notification } from "antd";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import axiosClient from "../../../apis/axiosClient";
import eventApi from "../../../apis/eventApi";

const { Content } = Layout;

const Cart = () => {

    const [productDetail, setProductDetail] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataForm, setDataForm] = useState([]);
    const [lengthForm, setLengthForm] = useState();
    const [cartLength, setCartLength] = useState();
    const [cartTotal, setCartTotal] = useState();
    const [form] = Form.useForm();
    let { id } = useParams();
    const history = useHistory();


    const handlePay = () => {
        history.push("/pay")
    }

    const deleteCart = () => {
        localStorage.removeItem("cart");
        localStorage.removeItem("cartLength");
        window.location.reload(true)
    }

    const updateQuantity = (productId, newQuantity) => {
        console.log(newQuantity);
        // Tìm kiếm sản phẩm trong giỏ hàng
        const updatedCart = productDetail.map((item) => {
            if (item._id === productId) {
                // Cập nhật số lượng và tính toán tổng tiền
                item.quantity = newQuantity;
                item.total = item.price * newQuantity;
            }
            return item;
        });
        const total = updatedCart.reduce((acc, item) => acc + (item.quantity * item.promotion), 0);
        setCartTotal(total);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setProductDetail(updatedCart);
    }

    const handleDelete = async (productId) => {
        const updatedCart = JSON.parse(localStorage.getItem('cart'));
        const filteredCart = updatedCart.filter((product) => product._id !== productId);
        localStorage.setItem('cart', JSON.stringify(filteredCart));
        setCartLength(cartLength - 1);
        setProductDetail(filteredCart);

      };

    const columns = [
        {
            title: 'ID',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Ảnh',
            dataIndex: 'image',
            key: 'image',
            render: (image) => <img src={image} style={{ height: 80 }} />,
            width: '10%'
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <a>{text}</a>,
        },
        {
            title: 'Giá',
            dataIndex: 'promotion',
            key: 'promotion',
            render: (text) => <a>{text.toLocaleString('vi', { style: 'currency', currency: 'VND' })}</a>,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text, record) => (
                <InputNumber
                    min={1}
                    defaultValue={text}
                    onChange={(value) => {
                        // gọi hàm updateQuantity để cập nhật số lượng sản phẩm
                        updateQuantity(record._id, value);
                    }}
                />
            ),
        },
        {
            title: 'Thành tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (text, record) => (
                <div>
                    <div className='groupButton'>
                        {(record.promotion * record.quantity).toLocaleString('vi', { style: 'currency', currency: 'VND' })}
                    </div>
                </div >
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (text, record) => (
              <Button type="danger" onClick={() => handleDelete(record._id)}>
                Xóa
              </Button>
            ),
          },
    ];

    useEffect(() => {
        (async () => {
            try {
                // await productApi.getDetailProduct(id).then((item) => {
                //     setProductDetail(item);
                // });
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                setProductDetail(cart);
                console.log(cart);
                const cartLength = localStorage.getItem('cartLength');
                setCartLength(cartLength);
                const total = cart.reduce((acc, item) => acc + (item.quantity * item.promotion), 0);
                setCartTotal(total);
                setLoading(false);

            } catch (error) {
                console.log('Failed to fetch event detail:' + error);
            }
        })();
        window.scrollTo(0, 0);
    }, [])

    return (
        <div>
            <div class="py-5">
                <Spin spinning={false}>
                    <Card className="container">
                        <div className="box_cart">
                            <Layout className="box_cart">
                                <Content className='site-layout-background'>
                                    <Breadcrumb>Đơn hàng</Breadcrumb>
                                    <br></br>
                                    <Row justify='end'>
                                        <Col>
                                            <Button type='default' danger>
                                                <DeleteOutlined />
                                                &nbsp;
                                                <span onClick={() => deleteCart()}>Xóa đơn hàng</span>
                                            </Button>
                                        </Col>
                                    </Row>
                                    <h2>
                                        Tổng sản phẩm <strong>({cartLength})</strong>
                                    </h2>
                                    <br></br>
                                    <Table columns={columns} dataSource={productDetail} pagination={false} />
                                    <Divider orientation='right'>
                                        <p>Thanh toán</p>
                                    </Divider>
                                    <Row justify='start'>
                                        <Col md={12}>
                                            <Divider orientation='left'>Chính sách</Divider>
                                            <ol>
                                                <li>Quy định về sản phẩm: Chúng tôi cam kết cung cấp những sản phẩm chất lượng, đúng với mô tả, hình ảnh và thông tin được cung cấp trên website.</li>
                                                <li>Quy định về vận chuyển: Chúng tôi cam kết vận chuyển hàng hóa đúng thời gian và địa điểm được yêu cầu bởi khách hàng. Nếu có bất kỳ sự cố nào xảy ra trong quá trình vận chuyển, chúng tôi sẽ liên hệ ngay với khách hàng để thông báo và đưa ra giải pháp kịp thời.</li>
                                            </ol>
                                        </Col>
                                    </Row>
                                    <br></br>
                                    <Row justify='end'>
                                        <Col>
                                            <Statistic
                                                title='Tổng tiền (đã bao gồm thuế).'
                                                value={`${Math.round(
                                                    cartTotal
                                                ).toFixed(0)}`}
                                                precision={0}
                                            />
                                            <Button style={{ marginTop: 16 }} type='primary' onClick={() => handlePay()}>
                                                Thanh toán ngay <CreditCardOutlined />
                                            </Button>
                                        </Col>
                                    </Row>
                                </Content>
                            </Layout>
                        </div>
                    </Card>
                </Spin>
            </div>
        </div >
    );
};

export default Cart;
