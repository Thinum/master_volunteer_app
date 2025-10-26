package at.jku.volunteer_app.contract;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthToken {
    private String token;
    private Date expiryDate;
}
