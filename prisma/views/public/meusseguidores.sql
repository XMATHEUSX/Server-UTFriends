SELECT
  perfil.user_id AS meu_id,
  (
    (
      jsonb_array_elements((perfil.seguidores -> 'seguidores' :: text)) ->> 'user_id' :: text
    )
  ) :: integer AS seguidor_userid,
  (
    jsonb_array_elements((perfil.seguidores -> 'seguidores' :: text)) ->> 'nickname' :: text
  ) AS seguidor_nickname
FROM
  perfil;