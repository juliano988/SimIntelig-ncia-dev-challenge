import React, { useState } from "react";
import Link from 'next/link';
import { Button, Container, Form, Spinner, Toast } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { User } from "../customTypes";

const schema = yup.object().shape({
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  password: yup.string().required('Senha é obrigatória')
});

export default function Login() {

  const [showToast, setShowToast] = useState<boolean>(false);
  const [reqStatus, setreqStatus] = useState<boolean>();
  const [reqMessage, setreqMessage] = useState<string>('');
  const [submitLoading, setsubmitLoading] = useState<boolean>(false);

  //teste123a
  //teste123a@teste.com
  //123

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  function onSubmit(data: { email: string, password: string }) {
    console.log(data)
    const reqHeader = new Headers();
    reqHeader.append('Content-Type', 'application/x-www-form-urlencoded');
    reqHeader.append('X-Requested-With', 'XMLHttpRequest');

    const reqData = new URLSearchParams({
      email: encodeURI(data.email),
      password: encodeURI(data.password),
    });

    const reqParams = { method: 'POST', headers: reqHeader, body: reqData }
    setsubmitLoading(true)
    fetch('https://api.avaliacao.siminteligencia.com.br/api/login', reqParams)
      .then(function (res) {
        return res.json()
      }).then(function (data: { sucesso: boolean, mensagem: string }) {
        console.log(data)
        if ((data as unknown as User).token) {
          localStorage.setItem('user', JSON.stringify(data as unknown as User));
          window.location.href = '/update-user';
        } else {
          setreqStatus(data.sucesso);
          setreqMessage(data.mensagem);
          setShowToast(true);
        }
        setsubmitLoading(false)
      })
  }

  return (
    <>
      <Container >
        <img src="sim-form-logo.PNG"></img>
        <Form className="text-left" onSubmit={handleSubmit(onSubmit)}>

          <div className="">
            <Form.Group className="w-100 m-1">
              <Form.Label>Login</Form.Label>
              <Form.Control type="email" placeholder="Seu login" defaultValue="teste123a@teste.com" isInvalid={errors.email} {...register("email")} />
              {errors.email ?
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback> : <p></p>}

            </Form.Group>

            <Form.Group className="w-100 m-1">
              <Form.Label>Senha</Form.Label>
              <Form.Control type="password" placeholder="Sua senha" defaultValue="123" isInvalid={errors.password} {...register("password")} />
              {errors.password ?
                <Form.Control.Feedback type="invalid">
                  {errors.password?.message}
                </Form.Control.Feedback> : <p></p>}
            </Form.Group>
          </div>

          <div className="w-100 text-right">
            <Link href="/create-user">
              <a>Criar uma conta</a>
            </Link>
          </div>

          <Button type="submit" disabled={submitLoading ? true : false} className="w-100 mt-2 btn-form" size="sm">
            {submitLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Entrar'}
          </Button>

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
}