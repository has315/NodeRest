DELIMITER $$
CREATE PROCEDURE edit_req_accept(
    IN pVoteId VARCHAR(255), 
    IN pAdded VARCHAR(255),
    IN pFirstName VARCHAR(255) CHARSET utf8,
    IN pLastName VARCHAR(255) CHARSET utf8,
    IN pJMBG VARCHAR(255),
    IN pDelegated VARCHAR(255) CHARSET utf8,
    IN pPhoneNumber VARCHAR(255)
     )
begin
    DELETE FROM vote_edit WHERE vote_id = pVoteId;
    UPDATE vote 
    SET first_name=pFirstName
        , last_name=pLastName
        , jmbg=pJMBG
        , phone_number=pPhoneNumber
        , delegated=pDelegated
     WHERE vote_id=pVoteId;
END$$
DELIMITER ;

-- Nakon kreiranja procedure
GRANT EXECUTE ON PROCEDURE PgrafDB.edit_req_accept TO pgraf_glas@localhost; FLUSH PRIVILEGES;