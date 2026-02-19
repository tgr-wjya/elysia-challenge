# elysia rest api mastery

i completed 5 elysia rest api milestone project

## date

- day 5
- 18 - 19 february 2026
- week 1

## time spent

- session 1: 1 hours 25 mins
- session 2: 12 mins

## struggle

- let me look back at what i'm struggling at;
- kinda struggle with the file i/o at first, thankfully i managed to understand it.
- schema is still blurry to me even though its easy to understand.
- its about making the swagger know that there's schema, i'm still struggling at that.
- i'm also still struggling documenting my api using swagger openapi.
- how do you even validate a push with a schema? and make the body to use existing schema? i get what its trying to achieve but i don't understand how to do it.
- what the hell is really `UnionEnum` and is it really a good idea to use it on an array of strings like that?
  - ```typescript
    status: t.UnionEnum(['pending', 'in-progress', 'completed']);
    ```

- what the hell is hooks??

## realization

- i couldn't stress this enough but yes elysia is easy as i always said.
- if i actually finish this tomorrow then file i/o with res/req might be easier than i thought. you essentially need to read the file -> push -> write which means:
  - ```typescript
    const app = new Elysia().post('/echo', async () => {
      // this reads the file!
      const body = await Bun.file('file.json').json();

      // this is what you're trying to push!
      const newEcho = {
        id: body.Date.now(),
      };

      // this push and write the file!
      body.push(newEcho);
      await Bun.write('file.json', JSON.stringify(newEcho, null, w));
    });
    ```

- remember to always check your `file.json` before attempting to push. the `body` variable or where you store the parsed file, will return whatever is in the json file.
- meaning, if the file contains something other than an array which your handler expect, it'll fail. i'll put the example in the [takeaways](#key-takeaways)
- which mean, if you're not using pushing an object, you should definitely simplify the schema.

## next project

- next project i'll be building a portfolio-kaomoji-api that i used on my portfolio site.
- yess, its a shame to admit this but i vibe-coded those project.
- but shame no more after i completed this project, i'd be able to take on those kaomoji rest api easily!

## honorary mention

nothing worth mentioning here.

## key takeaways

- all the takeaways already addressed in the [realization](#realization)
- i'll say mor if i have something to say obviously.
- what i did wrong in `body.push`:
  - ```typescript
    .post('/echo', () => {
      const body = await Bun.file('tasks.json').json() // this will return whatever the hell is in your json.file

      // your schema is expecting an object/array inside the body, or should i say it wants the body to look like this.
      const newSchema = {
        id: Date.now;
      }

      body.push(newSchema); // you'll get an error: 'body.push' is undefined)
    })
    ```

  - ```json
    // meaning, if your json looks like this:

    {
      "id": "1"
    }

    // and not like this:

    [
      {
        "id": 1771515538781
      }
    ]
    ```

  - it'll refuse to push because it thinks the body is wrong!
  - the more you know...

## find me

[portfolio](https://tgr-wjya.github.io) · [linkedin](https://linkedin.com/in/tegar-wijaya-kusuma-591a881b9) · [email](mailto:tgr.wjya.queue.top126@pm.me)

---

18 - 19 february 2026

made with ◉‿◉
