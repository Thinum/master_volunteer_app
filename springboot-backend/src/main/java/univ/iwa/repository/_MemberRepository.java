package univ.iwa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import univ.iwa.model._Member;

import java.util.Optional;

@Repository
public interface _MemberRepository extends JpaRepository<_Member, Integer> {
    Optional<_Member> findById(int id);
}
