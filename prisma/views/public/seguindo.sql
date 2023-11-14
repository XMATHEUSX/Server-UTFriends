SELECT
  perfil.user_id AS meu_id,
  (
    (
      jsonb_array_elements((perfil.seguindo -> 'seguindo' :: text)) ->> 'user_id' :: text
    )
  ) :: integer AS seguindo_userid,
  (
    jsonb_array_elements((perfil.seguindo -> 'seguindo' :: text)) ->> 'nickname' :: text
  ) AS seguindo_nickname
FROM
  perfil;