import './OrderItem.css';

import React, {useState} from 'react';
import { Form, Select, Input, Popover, Row, Col, Button, Upload, message } from 'antd';
import ToothSelector from '../ToothSelector/ToothSelector';
import { InfoCircleOutlined, UploadOutlined } from '@ant-design/icons';

import {FILE_TYPE_SINGLE, FileTypeList, ColorsList, MAX_LIMIT_FILE_SIZE} from '../config/general.conf';
import { MatCategoryList, MatCategoryItemsList } from '../config/materials.conf';
import schema from '../assets/teeth-schema-cropped.png' 

const { Option } = Select;

const initMaterial = MatCategoryList[0].id
const initModelList = MatCategoryItemsList.find(({refId}) => refId === initMaterial)

const mappedModels = MatCategoryItemsList.reduce(
  (acc, cur) =>
    Object.assign(acc, { [cur.refId]: cur.list.reduce((_acc, _cur) => Object.assign(_acc, { [_cur.id]: _cur }), {}) }),
  {}
)

const OrderItem = () => {
    const [fileType, setFileType] = useState(FILE_TYPE_SINGLE);
    const [materialType, setMaterialType] = useState(MatCategoryList[0].id);
    const [modelType, setModelType] = useState(initModelList.list[0].id);
    const [modelList, setModelList] = useState(initModelList.list);
    const [toothNums, setToothNums] = useState();
    const [file, setFile] = useState([])
    const [note, setNote] = useState()
    const [color, setColor] = useState(ColorsList[0].code)

    const changeMaterialHandler = (value) => {
        setMaterialType(value)

        const {list} = MatCategoryItemsList.find(({refId}) => refId === value)
        setModelList(list)
        setModelType(list[0].id)
    }

    const changeMaterialModelHandler = (value) => {
        setModelType(value)
    }

    // const changeSelectToothHandler = (value) => {
    //     setToothNums(value)
    // }

    const selectToothHandler = (value) => {
        setToothNums(value);
    }

    const composeOrder = () => {
        if (!file[0] || !toothNums || (Array.isArray(toothNums) && !toothNums.length)) {
            message.error('Файл и номер зуба не должен быть пустой');
            return;
        }

        const item = {
            id: new Date().getTime(),
            fileType: fileType,
            materialType: materialType,
            modelType: modelType,
            toothIDs: toothNums,
            file: file.pop(),
            color: color,
            note: note,
            totalPrice: mappedModels[materialType][modelType].prices.stl * (Array.isArray(toothNums) ? toothNums.length : 1),
            status: 'pending'
        }
        console.log(item);
        message.success('Complete!');
    }

    const props = {
        onRemove: file => {
            setFile([])
        },
        beforeUpload: file => {
            if(file.size > MAX_LIMIT_FILE_SIZE) {
                message.error(`Допустимый размер файла менее ${MAX_LIMIT_FILE_SIZE/1000000}МБ`);
                return false;
            }
            setFile([file])
            return false;
        },
    };

    const content = () => (
        <div className="contentTooth">
            <ToothSelector onSelect={selectToothHandler} toothNums={toothNums} mode={fileType === FILE_TYPE_SINGLE ? 'single' : 'multi'} />
          {/* <img alt="Tooth schema numbers" style={{maxWidth: 900}} src={schema}/> */}
        </div>
    )

    return(<section className="card__wrapper">
        <div className="card__content__container">
            <h2 className="card__title">Детали элемента заказа</h2>
            <Form labelCol={{
            span: 4,
            }}
            wrapperCol={{
            span: 18,
            }}
            layout="horizontal">
                <Form.Item label="Тип файла">
                    <Select defaultValue={fileType} style={{ width: 120 }} onChange={setFileType}>
                        {FileTypeList.map(item => ( <Option key={item.type} value={item.type}>{item.title}</Option>))}
                    </Select>
                </Form.Item>
                <Form.Item label="Материал">
                    <Select
                        value={materialType}
                        style={{ width: '100%' }}
                        placeholder="Выберите материал"
                        onChange={changeMaterialHandler}
                        >
                        {MatCategoryList.map(mat => ( <Option key={mat.id} value={mat.id}>{mat.title}</Option>))}
                    </Select>
                </Form.Item>
                <Form.Item label="Тип модели">
                    <Select     
                        value={modelType}
                        style={{ width: '100%' }}
                        placeholder="Выберите тип модели"
                        onChange={changeMaterialModelHandler}
                        >
                        {modelList.map(model => ( <Option key={model.id} value={model.id}>{model.title} - {model.prices.stl} Euro</Option>))}
                    </Select>
                </Form.Item>
                <Form.Item label="Цвет">
                    <Select defaultValue={color} style={{ width: 120 }} onChange={setColor}>
                        {ColorsList.map((item, index) => ( <Option key={index} value={item.code}>{item.title}</Option>))}
                    </Select>
                </Form.Item>
                {/* <ToothSelector onSelect={selectToothHandler} toothNums={toothNums} mode={fileType === FILE_TYPE_SINGLE ? 'single' : 'multi'} /> */}
                {/* <Form.Item label="Зубы" rules={[{ required: true }]}>
                    { fileType === FILE_TYPE_SINGLE ?
                        <Select
                            allowClear
                            style={{ width: '100%' }}
                            placeholder="Отметьте номер зуба"
                            onChange={changeSelectToothHandler}
                            >
                            {ToothList.map(item => ( <Option key={item.number} value={item.number}>{item.number} - {item.type}</Option>))}
                        </Select>
                        : 
                        <Select
                            mode="multiple"
                            maxTagCount={fileType === FILE_TYPE_SINGLE ? 1 : 50}
                            allowClear
                            style={{ width: '100%' }}
                            placeholder="Отметьте номера зубов"
                            onChange={changeSelectToothHandler}
                            >
                            {ToothList.map(item => ( <Option key={item.number} value={item.number}>{item.number} - {item.type}</Option>))}
                        </Select>
                    } 
                    
                
                </Form.Item> */}
                <div className="schema__wrapper">
                    <Popover trigger="hover" placement="bottom" content={content} title="Схема зубов">
                        <span className="scheme__wrapper"><InfoCircleOutlined style={{fontSize: 18}}/> Схема зубов</span>
                    </Popover>
                </div>
                <Form.Item label="Файл">
                    <Upload {...props} fileList={file}>
                        <Button icon={<UploadOutlined />}>Выбрать файл</Button>
                    </Upload>
                </Form.Item>
                <Form.Item label="Заметка">
                    <Input.TextArea onChange={({ target: { value } }) => setNote(value)} />
                </Form.Item>
                <Row>
                <Col span={22} style={{textAlign: 'right'}}>
                <Button danger shape="round" style={{ marginTop: 16,  marginRight: 16 }} type="primary">
                    Отменить
                </Button>
                    <Button shape="round" onClick={composeOrder} style={{ marginTop: 16}} type="primary">
                    Сохранить в заказе 
                </Button>
                
                </Col>
            </Row>
            </Form>
        </div>
        {/* <div className="selector__container">
            
        </div> */}
    </section>)
};

export default OrderItem;