# Outline
# Home assistant add-on: Outline

Outline is a fast knowledge base for growing teams. It's beautiful, supports realtime collaborative, is feature packed, and markdown compatible.

## Key Features
* Intuitive editing experience
* Collaborative in real-time
* Powerful search
* Integrated with Slack
* Public sharing

## Installation

The installation of this add-on is a bit technical as you need to define an auth method.

1. [Add my Hass.io add-ons repository][repository] to your Home Assistant instance.
1. Install this add-on.


## Configuration
1. Set your URL
2. Set the `env_vars` field with the Environment Variables you want to customize your installation. Look at [Outline's sample file](https://github.com/outline/outline/blob/main/.env.sample) for information/
  
    Note that the syntax of this field is a bit different, here's an example:
    ```yaml
    - name: DISCORD_CLIENT_ID
      value: "1234567890"
    - name: DISCORD_CLIENT_SECRET
      value: ClientSecretString
    - name: LOG_LEVEL
      value: debug
    ```

    Only strings are expected, use quotes to provide an int or boolean.

    ⚠️ Outline expects you to set up [at least one authentication method](https://docs.getoutline.com/s/hosting/doc/authentication-7ViKRmRY5o)! You can't log in with a personal Google account (`@gmail.com`) so I recomment to [use Discord](https://docs.getoutline.com/s/hosting/doc/discord-g4JdWFFub6) for example. You can't use Magic Link auth without having logged in another way first.
3. Start the addon go to `http://homeassistant.local:5785/` !

## Advanced customization
Use `env_vars` to customize everything (eg. allowing magic link authentication).

You can use an external Postgres server by setting the `postgres` configuration field to `external` and providing a `postgres_url` of the form `postgres://user:pass@localhost:5432/outline`

Likewise, you can use an external Redis server by setting `redis` to `external` and providing a `redis_url` like `redis://localhost:6379`