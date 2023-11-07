SELECT
  meusseguidores.meu_id,
  meusseguidores.seguidor_nickname,
  pensamentos.ds_pensamento,
  jsonb_array_length((pensamentos.curtidas -> 'curtidas' :: text)) AS curtidas,
  pensamentos.tipo_pensamento
FROM
  (
    meusseguidores
    JOIN pensamentos ON (
      (
        meusseguidores.seguidor_userid = pensamentos.user_id
      )
    )
  );