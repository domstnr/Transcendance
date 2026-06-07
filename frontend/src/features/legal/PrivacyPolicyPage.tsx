function PrivacyPolicyPage() {
    return (
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '2rem', lineHeight: 1.7 }}>
            <h1>Privacy Policy</h1>
            <p style={{ color: '#666', fontSize: 14 }}>Last updated: June 7, 2026</p>

            <p>
                This Privacy Policy describes how Transauction collects, uses,
                and stores information when you use our platform. By creating an account or using our
                services, you agree to the practices described below.
            </p>

            <h2>1. Information We Collect</h2>
            <p>When you register and use Transauction, we collect the following:</p>
            <ul>
                <li><strong>Account information:</strong> your email address, username, and a hashed version of your password. We never store your password in plain text.</li>
                <li><strong>Profile data:</strong> your avatar image if you choose to upload one, and your online/offline status.</li>
                <li><strong>Auction and item data:</strong> listings you create, bids you place, and auction history associated with your account.</li>
                <li><strong>Chat messages:</strong> messages you send in auction chat rooms are stored and associated with your account.</li>
                <li><strong>Friends and social data:</strong> friend requests you send or receive, and your friend list.</li>
                <li><strong>API keys:</strong> keys you generate to access our public API, including the name you gave each key and when it was created.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect exclusively to operate the Transauction platform:</p>
            <ul>
                <li>To authenticate you and maintain your session securely.</li>
                <li>To display your profile and listings to other users.</li>
                <li>To process bids and manage auction lifecycles.</li>
                <li>To enable real-time chat between auction participants.</li>
                <li>To show your online status to other users on the platform.</li>
            </ul>
            <p>We do not use your data for advertising, profiling, or any purpose beyond running the platform.</p>

            <h2>3. Data Sharing</h2>
            <p>
                We do not sell, rent, or share your personal information with any third parties.
                Your data stays within the Transauction infrastructure and is only accessible to
                other users to the extent required by the platform's features (e.g. your username
                and avatar are visible to other users; your email is not).
            </p>

            <h2>4. Data Retention</h2>
            <p>
                Your data is retained for as long as your account exists. If you delete your account,
                all associated data — including your listings, bids, chat messages, and friend
                relationships — is permanently deleted. Automated database backups may retain your
                data for a short additional period before being overwritten.
            </p>

            <h2>5. Cookies and Authentication</h2>
            <p>
                Transauction uses HTTP-only cookies to manage your session after login. These cookies
                are strictly necessary for the platform to function and are not used for tracking or
                analytics. No third-party cookies are set.
            </p>

            <h2>6. Security</h2>
            <p>
                All communication with Transauction is encrypted via HTTPS/TLS. Passwords are hashed
                using a strong algorithm before storage. We take reasonable measures to protect your
                data, but no system is completely immune to security risks.
            </p>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
                <li>Access the personal data we hold about you.</li>
                <li>Correct inaccurate information via your profile settings.</li>
                <li>Delete your account and all associated data at any time from your profile page.</li>
            </ul>

            <h2>8. Educational Context</h2>
            <p>
                Transauction is an educational project developed as part of a software engineering
                curriculum. It is not a commercial service. Data collected is used solely within the
                scope of this project and is not shared with any educational institution or third party.
            </p>

            <h2>9. Contact</h2>
            <p>
                If you have any questions about this Privacy Policy or how your data is handled,
                please contact the project team through the platform.
            </p>
        </section>
    )
}

export default PrivacyPolicyPage
