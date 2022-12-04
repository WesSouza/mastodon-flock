import { config } from "../config";
import { InternetNavigator } from "./InternetNavigator";
import { Anchor } from "./typography/Anchor";
import { Heading } from "./typography/Heading";
import { ListItem } from "./typography/ListItem";
import { Paragraph } from "./typography/Paragraph";
import { UnorderedList } from "./typography/UnorderedList";

export function About() {
  return (
    <InternetNavigator defaultUrl={config.urls.about} title="About">
      <Heading>About</Heading>
      <Paragraph>
        Mastodon Flock is a web application that allows you to find people you
        follow on Twitter that are also part of another social network from the
        Fediverse, such as Mastodon.
      </Paragraph>
      <Paragraph>
        It works by reading your Twitter follows information and checking if
        they have indicated a Mastodon account. You are then able to follow them
        or export a CSV that can be imported on your Mastodon instance.
      </Paragraph>
      <Paragraph>
        This is a personal project from{" "}
        <Anchor href="https://wes.dev/" target="_blank" rel="noopener">
          Wes Souza
        </Anchor>
        . You can read more about the{" "}
        <Anchor href="#technology-stack">technology stack below</Anchor>.
      </Paragraph>
      <Heading level={2} anchorName="how-to-use-it">
        How to use it?
      </Heading>
      <Paragraph>
        On our <Anchor href={config.urls.home}>Setup Wizard</Anchor>, click Next
        to be directed to Twitter, then click Authorize app.
      </Paragraph>
      <Paragraph>Then, select a method from the list.</Paragraph>
      <UnorderedList>
        <ListItem>
          &ldquo;Typical&rdquo; uses your Mastodon instance to find accounts.
          Once finished, it will also allow you to review, follow or unfollow
          the discovered accounts.
        </ListItem>
        <ListItem>
          &ldquo;Advanced&rdquo; can be used to search every account on their
          own instance directly. This can be used if you are not on Mastodon,
          but another ActivityPub-compatible network. Note: you won&rsquo;t be
          able to automatically follow or unfollow accounts.
        </ListItem>
      </UnorderedList>
      <Paragraph>
        After the Setup concludes, you are taken to the Mastodon Flock results
        window, which display every found account, as well as other options to
        help you follow them.
      </Paragraph>
      <Heading level={2} anchorName="how-does-it-work">
        How Does it Work?
      </Heading>
      <Paragraph>
        Mastodon Flock relies on your follows information to discover their
        Fediverse account. The Setup process will look for potential Fediverse
        accounts based oh their name, bio, location, website and pinned tweet.
      </Paragraph>
      <Paragraph>
        Those potential accounts are then searched, and every match is stored
        locally and presented in the results window.
      </Paragraph>
      <Heading level={2} anchorName="technology-stack">
        Technology Stack
      </Heading>
      <Paragraph>
        Mastodon Flock is a TypeScript project that utilizes React components
        and Astro as its building framework. The user interface uses
        styled-components and is powered by React95 components.
      </Paragraph>
      <Paragraph>
        On the server, we deploy assets and serverless functions to Vercel, and
        use MongoDB via Mongoose for storing the list of Mastodon instances and
        the necessary application tokens registered with them to enable user
        authentication (user tokens are never stored).
      </Paragraph>
      <Heading level={3} anchorName="source-code">
        Why Astro? Why styled-components?
      </Heading>
      <Paragraph>
        I wanted to experiment with Astro and pnpm for a project while also
        using React95. Unfortunately, React95 requires styled-components, which
        isn&rsquo;t compatible with Astro&rsquo;s server-side rendering or
        static site generation.
      </Paragraph>
      <Heading level={3} anchorName="source-code">
        Source Code
      </Heading>
      <Paragraph>
        The software is completely open source and available at{" "}
        <Anchor
          href="https://github.com/WesSouza/mastodon-flock"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          github.com/WesSouza/mastodon-flock
        </Anchor>
        .
      </Paragraph>
      <Heading level={2} anchorName="questions-and-comments">
        Questions and Comments
      </Heading>
      <Paragraph>
        Feel free to get in touch by{" "}
        <Anchor href="mailto:hey@wes.dev?subject=Mastodon%20Flock">
          email
        </Anchor>{" "}
        or{" "}
        <Anchor
          href="https://twitter.com/__WesSouza"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          Twitter
        </Anchor>
        . You can also message me on{" "}
        <Anchor
          href="https://mastodon.social/@wessouza"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          Mastodon
        </Anchor>
        , but be aware that direct messages are not private and can be read by
        instance administrators.
      </Paragraph>
    </InternetNavigator>
  );
}
