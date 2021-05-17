import React, { useEffect, useState } from "react";
import styles from '../styles/update-user-styles.module.scss'
import { Button, Container, Form, Spinner, Toast } from "react-bootstrap";
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
  const [submitLoading, setsubmitLoading] = useState<boolean>(false);

  const [showToast, setShowToast] = useState<boolean>(false);
  const [reqStatus, setreqStatus] = useState<boolean>();
  const [reqMessage, setreqMessage] = useState<string>('');

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
            }).then(function (data: { data: User }) {

              if (data.data) {
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
                    const tempObj: User = { ...browserUser, usuario: { ...browserUser.usuario, ...data.data } };
                    localStorage.setItem('user', JSON.stringify(tempObj));
                    setbrowserUser(tempObj);
                    setreqStatus(true);
                    setreqMessage('Usuário atualizado com sucesso!');
                    setShowToast(true);
                  })
              } else {
                setreqStatus(false);
                setreqMessage('Usuário não atualizado');
                setShowToast(true);
              }
            })

        } else {
          setreqStatus(false);
          setreqMessage('Cidade não encontrada');
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
        <Container >
          <img src="sim-form-logo.PNG"></img>

          <div className="d-flex justify-content-between">
            <h6 className="text-left">Atualizar dados</h6>
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
                {submitLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Registrar'}
              </Button>
            </div>

          </Form>
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