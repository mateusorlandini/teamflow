// WRONG — Pre-Java 16 boilerplate style. Do not write this.
// public class User {
//     private final String username;
//     private final String email;
//
//     public User(String username, String email) {
//         this.username = username;
//         this.email = email;
//     }
//
//     public String getUsername() { return username; }
//     public String getEmail() { return email; }
//     // plus equals(), hashCode(), toString()...
// }

// CORRECT — Modern Java record. Immutable, concise, with auto-generated
// constructor, accessors, equals(), hashCode(), and toString().
public record User(String username, String email) {

    // Compact constructor for validation (optional)
    public User {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username must not be blank");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email must not be blank");
        }
    }
}
