"use client";

import { z } from "zod";

import {
  GENDERS,
  LEVELS_OF_STUDY,
  RACES_OR_ETHNICITIES,
  SCHOOLS,
  SHIRT_SIZES,
} from "@blade/consts/knight-hacks";
import { InsertMemberSchema } from "@blade/db/schemas/knight-hacks";
import { Button } from "@blade/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@blade/ui/form";
import { Input } from "@blade/ui/input";
import { ResponsiveComboBox } from "@blade/ui/responsive-combo-box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@blade/ui/select";

export function MemberApplicationForm() {
  const form = useForm({
    schema: InsertMemberSchema.extend({
      // userId will be derived from the user's session on the server
      userId: z.undefined(),
      firstName: z.string().min(1, "Required"),
      lastName: z.string().min(1, "Required"),
      age: z
        .string()
        .min(1, "Required")
        .refine((value) => !isNaN(parseInt(value)), "Invalid age")
        .transform((value) => parseInt(value))
        .refine(
          (age) => age >= 18,
          "Must be at least 18 years old to be a Knight Hacks member",
        )
        .refine((age) => age <= 100, "Bruh be fr rn"),
      email: z.string().email("Invalid email").min(1, "Required"),
      phoneNumber: z
        .string()
        .regex(/^\d{3}-\d{3}-\d{4}$/, "Invalid phone number"),
    }),
    defaultValues: {
      firstName: "",
      lastName: "",
      age: "",
      email: "",
      phoneNumber: "",
    },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        noValidate
        onSubmit={form.handleSubmit((values) => {
          console.log(values);
        })}
      >
        <h1 className="text-2xl font-bold">Application Form</h1>
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="johndoe@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="123-456-7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input placeholder="18" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GENDERS.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="raceOrEthnicity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Race or Ethnicity</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your race or ethnicity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RACES_OR_ETHNICITIES.map((raceOrEthnicity) => (
                      <SelectItem key={raceOrEthnicity} value={raceOrEthnicity}>
                        {raceOrEthnicity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="levelOfStudy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Level of Study</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your level of study" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LEVELS_OF_STUDY.map((levelOfStudy) => (
                      <SelectItem key={levelOfStudy} value={levelOfStudy}>
                        {levelOfStudy}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="school"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School</FormLabel>
              <FormControl>
                <ResponsiveComboBox
                  items={SCHOOLS}
                  renderItem={(school) => <div>{school}</div>}
                  getItemValue={(school) => school}
                  getItemLabel={(school) => school}
                  onItemSelect={(school) => field.onChange(school)}
                  buttonPlaceholder="Select your school"
                  inputPlaceholder="Search for your school"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="shirtSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shirt Size</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your shirt size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SHIRT_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
