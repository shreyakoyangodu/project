import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import javax.swing.JOptionPane;

public class Connect {
    // JDBC URL, username, and password
    private static final String URL = "jdbc:mysql://localhost:3306/hospital_bed_management";
    private static final String USER = "root";
    private static final String PASSWORD = "Ugetlost5";

    // Method to establish a connection to the database
    public static Connection ConnectDB() {
        try {
            // Load the MySQL JDBC drivers
            Class.forName("com.mysql.cj.jdbc.Driver");
            // Establish the connection
            Connection con = DriverManager.getConnection(URL, USER, PASSWORD);
            return con;
        } catch (ClassNotFoundException | SQLException e) {
            JOptionPane.showMessageDialog(null, "Error connecting to the database: " + e.getMessage(), "Database Connection Error", JOptionPane.ERROR_MESSAGE);
            return null;
        }
    }
}
