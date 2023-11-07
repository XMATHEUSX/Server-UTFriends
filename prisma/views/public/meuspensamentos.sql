SELECT
  pensamentos.pensamento_id,
  perfil.nickname,
  pensamentos.ds_pensamento,
  jsonb_array_length((pensamentos.curtidas -> 'curtidas' :: text)) AS curtidas,
  pensamentos.tipo_pensamento
FROM
  (
    perfil
    JOIN pensamentos ON ((perfil.user_id = pensamentos.user_id))
  );