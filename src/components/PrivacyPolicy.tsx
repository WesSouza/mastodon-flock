import { config } from "../config";
import { InternetNavigator } from "./InternetNavigator";
import { Anchor } from "./typography/Anchor";
import { Heading } from "./typography/Heading";
import { ListItem } from "./typography/ListItem";
import { Paragraph } from "./typography/Paragraph";
import { UnorderedList } from "./typography/UnorderedList";

export function PrivacyPolicy() {
  return (
    <InternetNavigator defaultUrl={config.urls.privacy} title="Privacy Policy">
      <Heading>Privacy Policy</Heading>
      <Paragraph>
        Mastodon Flock was designed to read and store the least amount of user
        information possible. Authentication data is encrypted and stored
        locally. Results are also stored locally. All information is removed if
        you close the browser or navigate away from the website.
      </Paragraph>
      <Heading level={2}>User Data, Authentication and Results</Heading>
      <Paragraph>
        Logging in to Twitter or Mastodon provides us with temporary
        authentication tokens, which are encrypted and stored in a cookie. This
        cookie is only exposed to our servers, and allows them to read necessary
        information or act on your behalf.
      </Paragraph>
      <Paragraph>
        We don&rsquo;t store or log any user information or authentication data
        in our database, therefore we cannot access your Twitter or Mastodon
        data when you are not using the software.
      </Paragraph>
      <Paragraph>
        Results are stored temporarily in your browser, they only last during
        the current session. If you close all windows of the website, your
        browser will remove them automatically. Please note that some browsers
        will restore the data if you use the &ldquo;Reopen Last Closed
        Tab&rdquo; functionality.
      </Paragraph>
      <Heading level={2}>Usage Statistics</Heading>
      <Paragraph>
        We collect a small amount of usage data to help us understand how users
        interact with the software.
      </Paragraph>
      <Paragraph>Some information we collect include:</Paragraph>
      <Paragraph>
        <UnorderedList>
          <ListItem>
            Counts such as the number of accounts that were found and the number
            of accounts you have followed or unfollowed.
          </ListItem>
          <ListItem>
            Actions such as each step taken on the Setup, as which method was
            selected, following multiple accounts, or exporting as CSV. User
            entered information, such as the Mastodon instance, is never
            collected.
          </ListItem>
        </UnorderedList>
      </Paragraph>
      <Paragraph>
        No personal data or personally identifiable information is ever
        collected or stored. Your IP address and browser user agent are
        anonymized and used to calculate some metrics. You can read more about
        this on{" "}
        <Anchor
          href="https://plausible.io/data-policy"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          Plausible&rsquo;s Data Policy page
        </Anchor>
        .
      </Paragraph>
      <Heading level={2}>Revoking Access and Removing User Data</Heading>
      <Paragraph>We do not store user data.</Paragraph>
      <Paragraph>
        If you&rsquo;d like to remove our application from your Twitter account,
        navigate to your Twitter &ldquo;Settings&rdquo;, &ldquo;Security and
        account access&rdquo;, &ldquo;Apps and sessions&rdquo;, &ldquo;Connected
        apps&rdquo;,{" "}
        <Anchor
          href={config.urls.twitterAppRevoke}
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          &ldquo;Mastodon Flock&rdquo;
        </Anchor>{" "}
        then click &ldquo;Revoke app permissions&rdquo;.
      </Paragraph>
      <Paragraph>
        If you&rsquo;d like to remove our application from your Mastodon
        account, navigate to your Mastodon &ldquo;Preferences&rdquo;,
        &ldquo;Account&rdquo;, &ldquo;Authorized apps&rdquo;, &ldquo;Mastodon
        Flock&rdquo; then click &ldquo;Revoke&rdquo;.
      </Paragraph>
      <Heading level={2}>Changes and Questions</Heading>
      <Paragraph>
        We may update this policy as needed to comply with relevant regulations
        and reflect any new practices.
      </Paragraph>
      <Paragraph>
        Contact us at{" "}
        <Anchor href="mailto:hey@wes.dev?subject=Mastodon%20Flock%20privacy">
          hey@wes.dev
        </Anchor>{" "}
        if you have any questions, comments, or concerns about this privacy
        policy, your data, or your rights with respect to your information.
      </Paragraph>
      <Paragraph>Last updated: December 6th, 2022</Paragraph>
    </InternetNavigator>
  );
}
