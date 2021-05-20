import React, { useState } from "react";
import styles from '../styles/create-user-styles.module.scss'
import Link from 'next/link';
import { Button, Container, Form, Spinner, Toast } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

const schema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  password: yup.string().required('Senha é obrigatória'),
  password2: yup.string().oneOf([yup.ref('password'), null], 'As senhas devem ser idênticas')
});

export default function CreateUser() {

  const [showToast, setShowToast] = useState<boolean>(false);
  const [reqStatus, setreqStatus] = useState<boolean>();
  const [reqMessage, setreqMessage] = useState<string>('');
  const [submitLoading, setsubmitLoading] = useState<boolean>(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  function onSubmit(data: { name: string, email: string, password: string, password2: string }) {
    const reqHeader = new Headers();
    reqHeader.append('Content-Type', 'application/json');
    reqHeader.append('X-Requested-With', 'XMLHttpRequest');

    const reqData = {
      nome: encodeURI(data.name),
      email: encodeURI(data.email),
      password: encodeURI(data.password),
      password_confirmation: encodeURI(data.password2)
    }

    const reqParams = { method: 'POST', headers: reqHeader, body: JSON.stringify(reqData) }
    setsubmitLoading(true)
    fetch('https://api.avaliacao.siminteligencia.com.br/api/registrar', reqParams)
      .then(function (res) {
        return res.json()
      }).then(function (data: { sucesso: boolean, mensagem: string }) {
        if (data.sucesso) {
          reset();
          setTimeout(function () { window.location.href = '/' }, 3000)
        }
        setreqStatus(data.sucesso);
        setreqMessage(data.mensagem);
        setShowToast(true);
        setsubmitLoading(false)
      })
  }

  return (
    <>
      <div className="d-flex">
        <div className="d-flex flex-column justify-content-center vh-100 ml-5 mr-5">
          <div>
            <img src="sim-form-logo.PNG"></img>
          </div>
          <Form className="text-left" onSubmit={handleSubmit(onSubmit)}>

            <div className="d-flex justify-content-around">
              <Form.Group className="w-100 m-1">
                <Form.Label className="font-weight-bold">Nome</Form.Label>
                <Form.Control type="text" placeholder="Seu nome" size="sm" className={styles.form_input} isInvalid={errors.name} {...register("name")} />
                {errors.name ?
                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback> : <p></p>}

              </Form.Group>

              <Form.Group className="w-100 m-1">
                <Form.Label className="font-weight-bold">Email</Form.Label>
                <Form.Control type="email" placeholder="Seu email" size="sm" className={styles.form_input} isInvalid={errors.email} {...register("email")} />
                {errors.email ?
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback> : <p></p>}
              </Form.Group>
            </div>

            <div className="d-flex justify-content-around">
              <Form.Group className="w-100 m-1">
                <Form.Label className="font-weight-bold">Senha</Form.Label>
                <Form.Control type="password" placeholder="Sua senha" size="sm" className={styles.form_input} isInvalid={errors.password} {...register("password")} />
                {errors.password ?
                  <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback> : <p></p>}
              </Form.Group>

              <Form.Group className="w-100 m-1">
                <Form.Label className="font-weight-bold">Confirme sua Senha</Form.Label>
                <Form.Control type="password" placeholder="Confirme sua senha" size="sm" className={styles.form_input} isInvalid={errors.password2} {...register("password2")} />
                {errors.password2 ?
                  <Form.Control.Feedback type="invalid">
                    {errors.password2?.message}
                  </Form.Control.Feedback> : <p></p>}
              </Form.Group>
            </div>

            <div className="w-100 text-right">
              <Link href="/login">
                <a>Retornar para tela de login</a>
              </Link>
            </div>

            <Button type="submit" disabled={submitLoading ? true : false} className="w-100 mt-2 btn-form" size="sm">
              {submitLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Registrar'}
            </Button>

            <div className="d-flex justify-content-center mt-1">
              <p style={{ fontSize: '0.8rem' }} className="mr-1" >Ainda não possui uma conta?</p>
              <p style={{ fontSize: '0.8rem', color: "rgba(0, 226, 150, 1)" }}>Solicite uma demonstração</p>
            </div>

          </Form>
        </div>

        <div className={styles.char_div}></div>

      </div>

      <Toast style={{ position: 'absolute', top: 20, right: 20, color: 'white', backgroundColor: reqStatus ? '#28a745' : '#dc3545' }} onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
        <Toast.Header>
          <strong className="mr-auto">{reqStatus ? 'Sucesso!' : 'Erro'}</strong>
        </Toast.Header>
        <Toast.Body>{reqMessage}</Toast.Body>
      </Toast>

    </>
  )
}