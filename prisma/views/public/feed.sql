SELECT
  seguindo.meu_id,
  perfil.nickname,
  seguindo.seguindo_nickname,
  pensamentos.pensamento_id,
  pensamentos.ds_pensamento,
  jsonb_array_length((pensamentos.curtidas -> 'curtidas' :: text)) AS curtidas,
  pensamentos.tipo_pensamento,
  pensamentos.data_pensamento,
  CASE
    WHEN (
      EXISTS (
        SELECT
          1
        FROM
          curtidorespensamento
        WHERE
          (
            (
              curtidorespensamento.curtidor_userid = seguindo.meu_id
            )
            AND (
              curtidorespensamento.pensamento_id = pensamentos.pensamento_id
            )
          )
      )
    ) THEN TRUE
    ELSE false
  END AS curtiu
FROM
  (
    (
      seguindo
      JOIN pensamentos ON ((seguindo.seguindo_userid = pensamentos.user_id))
    )
    JOIN perfil ON ((seguindo.meu_id = perfil.user_id))
  )
ORDER BY
  pensamentos.data_pensamento DESC;