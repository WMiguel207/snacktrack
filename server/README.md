SnacTrack backend (example)

This is a minimal Node/Express example that shows how to connect to a MySQL database and expose simple REST endpoints for a React Native/Expo app to consume.

Quick start

1. Install dependencies

   npm install

2. Create `.env` from `.env.example` and set your DB credentials

3. Make sure your MySQL database has the sample tables. Example schema (quick):

   CREATE TABLE items (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(200), price DECIMAL(8,2));
   CREATE TABLE orders (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, created_at DATETIME);
   CREATE TABLE order_items (id INT AUTO_INCREMENT PRIMARY KEY, order_id INT, item_id INT, qty INT);

4. Run the server (development):

   npm run dev

5. Expose to your phone while developing (optional):

   - Install ngrok and run: `ngrok http 3000` to get a public HTTPS URL.
   - Use that URL in your mobile app (see React Native sample).

Security notes

- Never expose your database directly to the mobile app.
- Use parameterized queries (this example does) and validate inputs.
- Use SSL/TLS in production and authentication for your API.

