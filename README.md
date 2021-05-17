# Painel do Usuário SimInteligência

## Proposta

Criar um painel de administração dos dados do usuário com autenticação e criação de novos usuários.

## Ferramentas utilizadas

- Next.js;
- Bootstrap;
- React Hook Form;
- Yup.

## Utilização

No diretório raiz do projeto, executar os seguintes comandos via terminal:

```node
yarn build
yarn start
```

## Rotas

- ``GET /`` - **Domínio da aplicação**
  - Se o usuário estiver autenticado, ele será redirecionado para a tela de atualização de dados;
  - Se o usuário não estiver autenticado, ele será redirecionado para a tela de login.

- ``GET /login`` - **Tela de login**
  - O usuário poderá realizar sua autenticação;
  - Ou acessar a tela de cadastro de novo usuário.

- ``GET /create-user`` - **Tela de cadastro de novo usuário**
  - O usuário poderá cadastrar um novo usuário;
  - Ou retornar para a tela de autenticação.

- ``GET /update-user`` - **Tela de atualização de dados do usuário**
  - O usuário poderá alterar suas informações cadastrais;
  - E poderá também cancelar sua autenticação do sistema.