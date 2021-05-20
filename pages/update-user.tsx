import React, { useEffect, useState } from "react";
import styles from '../styles/update-user-styles.module.scss'
import { Button, Card, Col, Container, Form, Row, Spinner, Toast } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useValidationsBR, validatePhone } from 'validations-br';
import { UpdateData, User } from "../customTypes";


const schema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  phone: yup.string().test('isValid', 'Telefone inválido', (value) => validatePhone(value)).required('Telefone é obrigatório'),
  logradouro: yup.string().required('Logradouro é obrigatório'),
  cpf: yup.string().test('isValid', 'CPF inválido', (value) => useValidationsBR('cpf', value)).required('CPF é obrigatório'),
  cidade: yup.string().required('Cidade é obrigatório'),
});

export default function UpdateUser() {

  const [browserHasUser, setbrowserHasUser] = useState<boolean>(false);
  const [browserUser, setbrowserUser] = useState<User>();

  const [logOutLoading, setlogOutLoading] = useState<boolean>(false);

  const [showToast, setShowToast] = useState<boolean>(false);
  const [reqStatus, setreqStatus] = useState<boolean>();
  const [reqMessage, setreqMessage] = useState<string>('');

  const [submitLoading, setsubmitLoading] = useState<boolean>(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  useEffect(function () {
    if (!localStorage.getItem('user')) {
      window.location.replace('/login');
      setbrowserHasUser(false);
    } else {
      const tempObj: User = JSON.parse(localStorage.getItem('user'));

      const reqHeader = new Headers();
      reqHeader.append('Authorization', 'Bearer ' + tempObj.token);
      reqHeader.append('Content-Type', 'application/json');
      reqHeader.append('X-Requested-With', 'XMLHttpRequest');

      const reqParams = { headers: reqHeader };
      fetch('https://api.avaliacao.siminteligencia.com.br/api/v1/carrega-cidade/' + tempObj.usuario.cidade_id, reqParams)
        .then(function (res) {
          return res.json()
        }).then(function (data: { data: { nome: string } }) {
          setValue('name', tempObj.usuario.nome);
          setValue('email', tempObj.usuario.email);
          setValue('phone', tempObj.usuario.telefone);
          setValue('logradouro', tempObj.usuario.endereco);
          setValue('cpf', tempObj.usuario.cpf);
          setValue('cidade', data.data ? data.data.nome : '');
          setbrowserUser(tempObj);
          setbrowserHasUser(true);
        })
    }
  }, []);

  function onSubmit(data: UpdateData) {
    const reqHeader = new Headers();
    reqHeader.append('Authorization', 'Bearer ' + browserUser.token);
    reqHeader.append('Content-Type', 'application/json');
    reqHeader.append('X-Requested-With', 'XMLHttpRequest');

    const reqParams = { headers: reqHeader };
    setsubmitLoading(true);
    fetch('https://api.avaliacao.siminteligencia.com.br/api/v1/busca-cidade/' + data.cidade, reqParams)
      .then(function (res) {
        return res.json()
      }).then(function (cityData: { data: Array<{ id: number }> }) {

        if (cityData.data.length) {
          const reqHeader = new Headers();
          reqHeader.append('Authorization', 'Bearer ' + browserUser.token);
          reqHeader.append('Content-Type', 'application/json');
          reqHeader.append('X-Requested-With', 'XMLHttpRequest');

          const reqData = {
            usuario_id: encodeURI(browserUser.usuario.id),
            nome: encodeURI(data.name),
            email: encodeURI(data.email),
            telefone: encodeURI(data.phone),
            endereco: encodeURI(data.logradouro),
            cidade_id: encodeURI(cityData.data[0].id.toString(10)),
            cpf: encodeURI(data.cpf),
          } as unknown as User;

          const reqParams = { method: 'POST', headers: reqHeader, body: JSON.stringify(reqData) };
          fetch('https://api.avaliacao.siminteligencia.com.br/api/v1/editar-usuario', reqParams)
            .then(function (res) {
              return res.json()
            }).then(function (data: { data: User['usuario'] }) {
              const userData = data.data;

              if (userData) {
                const reqHeader = new Headers();
                reqHeader.append('Authorization', 'Bearer ' + browserUser.token);
                reqHeader.append('Content-Type', 'application/json');
                reqHeader.append('X-Requested-With', 'XMLHttpRequest');

                const reqParams = { headers: reqHeader };
                fetch('https://api.avaliacao.siminteligencia.com.br/api/v1/carrega-cidade/' + cityData.data[0].id.toString(10), reqParams)
                  .then(function (res) {
                    return res.json()
                  }).then(function (data: { data: { nome: string } }) {
                    setValue('cidade', data.data.nome);
                    const tempObj: User = { ...browserUser, usuario: { ...userData } };
                    console.log(userData)
                    localStorage.setItem('user', JSON.stringify(tempObj));
                    console.log(tempObj)
                    setreqStatus(true);
                    setreqMessage('Usuário atualizado com sucesso!');
                    setsubmitLoading(false);
                    setShowToast(true);
                  })
              } else {
                setreqStatus(false);
                setreqMessage('Usuário não atualizado');
                setsubmitLoading(false);
                setShowToast(true);
              }
            })
        } else {
          setreqStatus(false);
          setreqMessage('Cidade não encontrada');
          setsubmitLoading(false);
          setShowToast(true);
        }
      })
  }

  function handleClickExitBtn() {
    const reqHeader = new Headers();
    reqHeader.append('Authorization', 'Bearer ' + browserUser.token);
    reqHeader.append('Content-Type', 'application/json');
    reqHeader.append('X-Requested-With', 'XMLHttpRequest');

    const reqParams = { headers: reqHeader };
    setlogOutLoading(true)
    fetch('https://api.avaliacao.siminteligencia.com.br/api/v1/logout', reqParams)
      .then(function (res) {
        return res.json()
      }).then(function (data) {
        localStorage.clear();
        window.location.href = '';
      })
  }

  function handleClickClearBtn() {
    setValue('name', '');
    setValue('email', '');
    setValue('phone', '');
    setValue('logradouro', '');
    setValue('cpf', '');
    setValue('cidade', '');
  }

  if (browserHasUser) {
    return (
      <>
        <Container fluid>
          <Row className="justify-content-center align-items-center flex-nowrap border-bottom text-left">
            <Col className="border-right d-flex justify-content-center">
              <img className={styles.logo_img} src="sim-form-logo.PNG"></img>
            </Col>

            <Col sm={5} md={6} lg={7}>
              <h6>Cadastro de usuário</h6>
              <div className="d-flex justify-content-center align-items-center">
                <div className={styles.progress_bar + " mr-2"}>
                  <div className={styles.progress_content}></div>
                </div>
                <p className="m-auto font-weight-bold">50%</p>
              </div>
            </Col>

            <Col>
              <div className="d-flex justify-content-center align-items-center">
                <img src="user-avatar.PNG"></img>
                <div className="mr-1">
                  <p style={{ lineHeight: '15px', fontSize: '0.8rem', color: '#b0bdd9' }} className="mb-0">GrupoTMT</p>
                  <p style={{ lineHeight: '15px', fontSize: '0.8rem', color: '#b0bdd9' }} className="mb-0 font-weight-bold">Júlio Faria</p>
                </div>
                <p style={{ fontSize: '1.5rem', color: 'rgba(0, 226, 150, 1)' }} className="mb-1 font-weight-bold align-self-end">75.7</p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(0, 226, 150, 1)' }} className="mb-2 font-weight-bold align-self-end">XP</p>
              </div>
            </Col>
          </Row>

          <Row>
            <Col className="border-right pt-5">
              <div className="d-flex align-items-center">
                <img src="check.png"></img>
                <p style={{ fontSize: '0.8rem', color: 'rgba(0, 226, 150, 1)' }} className="mb-0 font-weight-bold">1 - Cadastro realizado</p>
              </div>
              <hr className="mt-1 mb-1"></hr>
              <div className="d-flex align-items-center">
                <img src="not-check.png"></img>
                <p style={{ fontSize: '0.8rem', color: '#b0bdd9' }} className="mb-0 font-weight-bold">2 - Completar cadastro</p>
              </div>
              <hr className="mt-1 mb-1"></hr>
            </Col>

            <Col sm={5} md={6} lg={7} className="pt-5" style={{ backgroundColor: '#f9fbfd' }}>
              <Card style={{ borderColor: '#f1f4fa' }}>
                <Card.Body className="p-5">
                  <div className="d-flex justify-content-between align-items-end">
                    <h6 className="text-left">Completar cadastro</h6>
                    <p className="mb-0 font-weight-bold" style={{ color: '#b0bdd9' }}>Página 1 – 2 de 2</p>
                  </div>

                  <div className={styles.form_title_line + " mb-4"}>
                    <div className={styles.form_title_content}></div>
                  </div>

                  <div className="mr-5 ml-5">
                    <p className="mb-0 font-weight-bold text-left">Seu cadastro foi criado com sucesso, para acessar ao conteúdo exclusivo do Grupo TMT.<br />
                      Complete seus dados de acesso para liberar sua conta</p>

                    <div className="d-flex justify-content-end">
                      <Button type="submit" onClick={handleClickExitBtn} disabled={submitLoading ? true : false} variant="danger" size="sm">
                        {logOutLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Sair'}
                      </Button>
                    </div>

                    <Form className="text-left" onSubmit={handleSubmit(onSubmit)}>

                      <div className="d-flex justify-content-around">
                        <Form.Group className="w-100 m-1">
                          <Form.Label>Nome</Form.Label>
                          <Form.Control type="text" placeholder="Nome e sobrenome" isInvalid={errors.name} {...register("name")} />
                          {errors.name ?
                            <Form.Control.Feedback type="invalid">
                              {errors.name?.message}
                            </Form.Control.Feedback> : <p></p>}

                        </Form.Group>

                        <Form.Group className="w-100 m-1">
                          <Form.Label>Email</Form.Label>
                          <Form.Control type="email" placeholder="email@exemplo.com" isInvalid={errors.email} {...register("email")} />
                          {errors.email ?
                            <Form.Control.Feedback type="invalid">
                              {errors.email?.message}
                            </Form.Control.Feedback> : <p></p>}
                        </Form.Group>
                      </div>

                      <div className="d-flex justify-content-around">
                        <Form.Group className="w-100 m-1">
                          <Form.Label>Telefone</Form.Label>
                          <Form.Control type="number" placeholder="DD9XXXXXXXX" isInvalid={errors.phone} {...register("phone")} />
                          {errors.phone ?
                            <Form.Control.Feedback type="invalid">
                              {errors.phone?.message}
                            </Form.Control.Feedback> : <p></p>}
                        </Form.Group>

                        <Form.Group className="w-100 m-1">
                          <Form.Label>Logradouro</Form.Label>
                          <Form.Control type="text" placeholder="Digite seu logradouro" isInvalid={errors.logradouro} {...register("logradouro")} />
                          {errors.logradouro ?
                            <Form.Control.Feedback type="invalid">
                              {errors.logradouro?.message}
                            </Form.Control.Feedback> : <p></p>}
                        </Form.Group>
                      </div>

                      <div className="d-flex justify-content-around">
                        <Form.Group className="w-100 m-1">
                          <Form.Label>CPF</Form.Label>
                          <Form.Control type="number" placeholder="Digite seu CPF" isInvalid={errors.cpf} {...register("cpf")} />
                          {errors.cpf ?
                            <Form.Control.Feedback type="invalid">
                              {errors.cpf?.message}
                            </Form.Control.Feedback> : <p></p>}
                        </Form.Group>

                        <Form.Group className="w-100 m-1">
                          <Form.Label>Cidade</Form.Label>
                          <Form.Control type="text" placeholder="Digite sua cidade" isInvalid={errors.cidade} {...register("cidade")} />
                          {errors.cidade ?
                            <Form.Control.Feedback type="invalid">
                              {errors.cidade?.message}
                            </Form.Control.Feedback> : <p></p>}
                        </Form.Group>
                      </div>

                      <div className={styles.btns_div + " mt-2 mb-3 d-flex justify-content-end"}>
                        <Button type="submit" onClick={handleClickClearBtn} disabled={submitLoading ? true : false} variant="secondary" className="w-25" size="sm">
                          Limpar
                        </Button>

                        <Button type="submit" disabled={submitLoading ? true : false} className="w-25 ml-2 btn-form" size="sm">
                          {submitLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Salvar'}
                        </Button>
                      </div>

                    </Form>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col className="border-left pt-5">
              <div className="d-flex align-items-center">
                <img src="group-icon.png"></img>
                <p style={{ fontSize: '0.8rem', color: '#b0bdd9' }} className="mb-0 font-weight-bold">Perguntas frequentes</p>
              </div>
              <Card style={{ borderColor: '#f1f4fa' }} className="mt-4" >
                <Card.Body className="p-3">
                  <p style={{ fontSize: '0.8rem', color: '#b0bdd9' }} className="mb-0 font-weight-bold text-left">Dúvidas</p>
                  <p style={{ fontSize: '0.8rem' }} className="mb-0 font-weight-bold text-left">Este espaço está reservado para que você possar esclarecer todas as suas dúvidas.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col className="ml-0 mr-0 pt-2 pb-5 border-top border-right">
              <div style={{ marginLeft: '-14px', marginRight: '-14px' }} className="">
                <img src="left-col-menu.PNG"></img>
              </div>
            </Col>

            <Col sm={5} md={6} lg={7} style={{ backgroundColor: '#f9fbfd' }}></Col>

            <Col className="border-left">
              <p style={{ fontSize: '0.8rem', color: '#b0bdd9' }} className="mb-0 font-weight-bold text-left">Digite sua dúvida</p>
              <hr className="mt-1 mb-1"></hr>
            </Col>
          </Row>

        </Container>

        <Toast style={{ position: 'absolute', top: 20, right: 20, color: 'white', backgroundColor: reqStatus ? '#28a745' : '#dc3545' }} onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Header>
            <strong className="mr-auto">{reqStatus ? 'Sucesso!' : 'Erro'}</strong>
          </Toast.Header>
          <Toast.Body>{reqMessage}</Toast.Body>
        </Toast>

      </>
    )
  } else { return (<></>) }

}