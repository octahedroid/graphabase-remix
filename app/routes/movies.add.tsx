import type { ActionArgs, LoaderArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Fragment } from "react";
import { Form } from "~/components/forms/form";
import { formAction } from "~/components/forms/form.action";
import { SelectInput } from "~/components/forms/select";
import { createMovieMutation } from "~/graphql/Movies/mutations.server";
import { createMovieSchema } from "~/graphql/Movies/schema";
import { getClient } from "~/graphql/client.server";
import { years } from "~/lib/utils";

export const loader = async ({ request, context }: LoaderArgs) => {
  const client = await getClient(context);

  const {
    movies: { findManyGenre: genres },
  } = await client.query({
    movies: {
      findManyGenre: {
        __args: {
          orderBy: [
            {
              name: "asc",
            },
          ],
        },
        id: true,
        name: true,
      },
    },
  });

  return {
    genres,
  };
};

export const action = async ({ request, context }: ActionArgs) =>
  formAction({
    request,
    schema: createMovieSchema,
    mutation: createMovieMutation,
    successPath: "/movies",
    environment: context,
  });

export default function MusicAdd() {
  const { genres } = useLoaderData<typeof loader>();

  return (
    <div className="flex justify-center w-full">
      <Form
        schema={createMovieSchema}
        className="space-y-4 w-full max-w-2xl"
        method="post"
        options={{
          genre: genres.map((genre) => ({
            name: genre.name,
            value: genre.id,
          })),
          year: years.map((year) => ({
            name: year,
            value: year,
          })),
        }}
        multiline={["synopsis"]}
      >
        {({ Field, Errors, Button, setValue, submit }) => {
          return (
            <Fragment>
              <Field name="title" label="Title" />
              <Field name="year" hidden />
              <Field name="genre" hidden />
              <Field name="director" />
              <Field name="genre" label="Genre">
                {({ options, label, Label, Error, value }) => (
                  <Fragment>
                    <Label />
                    <SelectInput
                      label={label}
                      options={options}
                      setValueChange={(value) =>
                        setValue("genre", value, {
                          shouldValidate: false,
                          shouldDirty: false,
                          shouldTouch: false,
                        })
                      }
                    />
                    <Error />
                  </Fragment>
                )}
              </Field>
              <Field name="year" label="Release Year">
                {({ options, Label, Error }) => (
                  <Fragment>
                    <Label />
                    <SelectInput
                      label={`Year`}
                      options={options}
                      setValueChange={(value) =>
                        setValue("year", Number(value), {
                          shouldValidate: false,
                          shouldDirty: false,
                          shouldTouch: false,
                        })
                      }
                    />
                    <Error />
                  </Fragment>
                )}
              </Field>
              <Field name="synopsis" label="Synopsis" />
              <Field name="cast" label="Cast" />
              <Errors />
              <Button
                onClick={() => {
                  submit();
                }}
                className="w-full"
              >
                Save
              </Button>
            </Fragment>
          );
        }}
      </Form>
    </div>
  );
}
