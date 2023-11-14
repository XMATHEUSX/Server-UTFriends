SELECT
  seguindo.meu_id,
  seguindo.seguindo_nickname,
  pensamentos.ds_pensamento,
  jsonb_array_length((pensamentos.curtidas -> 'curtidas' :: text)) AS curtidas,
  pensamentos.tipo_pensamento,
  pensamentos.data_pensamento
FROM
  (
    seguindo
    JOIN pensamentos ON ((seguindo.seguindo_userid = pensamentos.user_id))
  )
ORDER BY
  pensamentos.data_pensamento;