SELECT
  pensamentos.pensamento_id,
  (
    (
      jsonb_array_elements((pensamentos.curtidas -> 'curtidas' :: text)) ->> 'user_id' :: text
    )
  ) :: integer AS curtidor_userid,
  (
    jsonb_array_elements((pensamentos.curtidas -> 'curtidas' :: text)) ->> 'nickname' :: text
  ) AS curtidor_nickname
FROM
  pensamentos;