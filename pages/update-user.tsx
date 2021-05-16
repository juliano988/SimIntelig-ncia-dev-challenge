import { useEffect, useState } from "react";


export default function UpdateUser() {

  const [browserHasUser, setbrowserHasUser] = useState<boolean>(false)

  useEffect(function () {
    if (!localStorage.getItem('user')) {
      window.location.replace('/login');
      setbrowserHasUser(false);
    } else {
      setbrowserHasUser(true);
    }
  }, [])

  if (browserHasUser) {
    return (
      <>
        Atualizar usuário.
      </>
    )
  } else { return (<></>) }

}