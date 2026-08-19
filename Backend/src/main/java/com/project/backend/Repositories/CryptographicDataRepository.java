package com.project.backend.Repositories;

import com.project.backend.Entities.CryptographicData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CryptographicDataRepository extends JpaRepository<CryptographicData, Long> {

//    @Query("SELECT cd FROM CryptographicData cd WHERE cd.user.id = :userId ORDER BY cd.createdAt DESC LIMIT 20")
//    List<CryptographicData> findLast20ByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM CryptographicData c WHERE c.user.username = :username ORDER BY c.createdAt DESC LIMIT 20")
    List<CryptographicData> findLast20ByUsername(@Param("username") String username);
}
