function TermsOfServicePage() {
    return (
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '2rem', lineHeight: 1.7 }}>
            <h1>Terms of Service</h1>
            <p style={{ color: '#666', fontSize: 14 }}>Last updated: June 7, 2026</p>

            <p>
                These Terms of Service ("Terms") govern your use of the Transauction platform.
                By creating an account or using any part of the service, you agree to be bound
                by these Terms. If you do not agree, do not use the platform.
            </p>

            <h2>1. Eligibility</h2>
            <p>
                You must be at least 18 years old to create an account and use Transauction.
                By registering, you confirm that the information you provide is accurate and that
                you are legally capable of entering into binding agreements.
            </p>

            <h2>2. Accounts</h2>
            <ul>
                <li>You are responsible for keeping your login credentials confidential.</li>
                <li>You are responsible for all activity that occurs under your account.</li>
                <li>You may not create multiple accounts or impersonate another person.</li>
                <li>We reserve the right to terminate accounts that violate these Terms.</li>
            </ul>

            <h2>3. Listings and Auctions</h2>
            <ul>
                <li>You may only list items that you own and have the legal right to sell.</li>
                <li>Listings must accurately describe the item, including its condition and category.</li>
                <li>You may not list counterfeit, stolen, illegal, or prohibited items.</li>
                <li>Once an auction has received bids or chat activity, it cannot be deleted.</li>
                <li>Auction end dates are final. Sellers cannot extend or cancel an active auction after bids have been placed.</li>
            </ul>

            <h2>4. Bidding</h2>
            <ul>
                <li>All bids are binding. By placing a bid, you commit to purchasing the item at that price if you win.</li>
                <li>Bids must be higher than the current price. Bids that do not meet this requirement will be rejected.</li>
                <li>Once placed, a bid cannot be withdrawn.</li>
                <li>The highest bidder at the time the auction closes is the winner.</li>
            </ul>

            <h2>5. Chat Rooms</h2>
            <ul>
                <li>Auction chat rooms are accessible to bidders and the seller while the auction is open.</li>
                <li>Once an auction closes, only the seller and the winning bidder retain access to the chat room.</li>
                <li>You are solely responsible for the content of messages you send.</li>
                <li>Harassment, spam, threats, or any abusive behaviour in chat is prohibited and may result in account termination.</li>
            </ul>

            <h2>6. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul>
                <li>Attempt to gain unauthorised access to other accounts or platform systems.</li>
                <li>Use automated scripts, bots, or tools to interact with the platform.</li>
                <li>Interfere with or disrupt the platform's infrastructure.</li>
                <li>Use the platform for any unlawful purpose.</li>
                <li>Attempt to manipulate auction prices through collusion or fake accounts.</li>
            </ul>

            <h2>7. Intellectual Property</h2>
            <p>
                All content you upload (including item descriptions and images) remains yours.
                By uploading it, you grant Transauction a non-exclusive licence to display it
                as part of operating the platform. You may not upload content that infringes
                on a third party's intellectual property rights.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
                Transauction is provided as-is, without warranties of any kind. We are not
                responsible for any damages arising from your use of the platform, including
                but not limited to failed transactions, lost data, or service interruptions.
                As an educational project, the platform may be unavailable or reset at any time.
            </p>

            <h2>9. Account Deletion</h2>
            <p>
                You may ask for the deletion of your account at any time by contacting the team. Deletion is
                permanent and will remove all your data from the platform, including your
                listings, bids, and messages. Active auctions with bids may not be deletable
                until they have closed.
            </p>

            <h2>10. Changes to These Terms</h2>
            <p>
                We may update these Terms at any time. Continued use of the platform after
                changes are posted constitutes acceptance of the new Terms.
            </p>

            <h2>11. Educational Context</h2>
            <p>
                Transauction is an educational project and does not facilitate real financial
                transactions. No actual money changes hands. These Terms exist to define expected
                user behaviour within the scope of the project.
            </p>
        </section>
    )
}

export default TermsOfServicePage
