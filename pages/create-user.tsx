import React from "react";
import { Button, Container, Form } from "react-bootstrap";
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

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
  function onSubmit(data: { name: string, email: string, password: string, password2: string }) {
    console.log(data)
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
    fetch('https://api.avaliacao.siminteligencia.com.br/api/registrar', reqParams)
      .then(function (res) {
        return res.json()
      }).then(function (data) {
        console.log(data)
      })

  }

  return (
    <Container >
      <img src="sim-form-logo.PNG"></img>
      <Form className="text-left" onSubmit={handleSubmit(onSubmit)}>

        <div className="d-flex justify-content-around">
          <Form.Group className="w-100 m-1">
            <Form.Label>Nome</Form.Label>
            <Form.Control type="text" placeholder="Seu nome" isInvalid={errors.name} {...register("name")} />
            {errors.name ?
              <Form.Control.Feedback type="invalid">
                {errors.name?.message}
              </Form.Control.Feedback> : <p></p>}

          </Form.Group>

          <Form.Group className="w-100 m-1">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="Seu email" isInvalid={errors.email} {...register("email")} />
            {errors.email ?
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback> : <p></p>}
          </Form.Group>
        </div>

        <div className="d-flex justify-content-around">
          <Form.Group className="w-100 m-1">
            <Form.Label>Senha</Form.Label>
            <Form.Control type="password" placeholder="Sua senha" isInvalid={errors.password} {...register("password")} />
            {errors.password ?
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback> : <p></p>}
          </Form.Group>

          <Form.Group className="w-100 m-1">
            <Form.Label>Confirme sua Senha</Form.Label>
            <Form.Control type="password" placeholder="Confirme sua senha" isInvalid={errors.password2} {...register("password2")} />
            {errors.password2 ?
              <Form.Control.Feedback type="invalid">
                {errors.password2?.message}
              </Form.Control.Feedback> : <p></p>}
          </Form.Group>
        </div>

        <Button type="submit" className="w-100 mt-2 btn-form" size="sm">Registrar</Button>

      </Form>
    </Container>
  )
}