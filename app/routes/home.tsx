import { zodResolver } from "@hookform/resolvers/zod";
import type { Column, ColumnDef, SortDirection } from "@tanstack/react-table";
import { useQuery } from "convex/react";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from 'zod';
import Autocomplete from "~/components/ui/autocomplete";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "~/components/ui/combobox";
import { ContentWrapper } from "~/components/ui/content-wrapper";
import { DataTable } from "~/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "~/components/ui/item";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/home";

dayjs.extend(customParseFormat);

//====//

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Shoes!" },
    { name: "description", content: "" },
  ];
}

//----//

interface ShoeProps {
  id: string;
  name: string;
  brand: string;
  color: string;
  count: number;
  lastworndate: string;
}

const SAMPLE_SHOES_DATA: ShoeProps[] = [
  {
    id: '1',
    name: '1461',
    brand: 'Dr. Martens',
    color: 'Black',
    count: 10,
    lastworndate: '01/05/2026',
  },
  {
    id: '10',
    name: '1460 Made in England',
    brand: 'Dr. Martens',
    color: 'Black',
    count: 5,
    lastworndate: '03/04/2026',
  },
  {
    id: '01',
    name: 'Ripple Monkey Boots',
    brand: 'George Cox',
    color: 'Black',
    count: 3,
    lastworndate: '15/04/2026',
  }
];

const SAMPLE_BRANDS_DATA: string[] = [
  'Converse',
  'Dr. Martens',
  'George Cox',
  'Onitsuka Tiger'
];

const fetchSuggestions = async (query: string): Promise<string[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay

  return SAMPLE_BRANDS_DATA.filter((suggestion) =>
    suggestion.toLowerCase().includes(query.toLowerCase()),
  )
}

//----//

function DataTableHeaderSortButton({ column, children }: { column: Column<ShoeProps>; children: React.ReactNode; }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="p-0 border-0"
    >
      {children}
      <SortIcon sortState={column.getIsSorted()} className="h-4 w-4" />
    </Button>
  );
}

function SortIcon({ sortState, ...props }: { sortState: false | SortDirection; className?: string; }) {
  let IconComponent = ChevronsUpDownIcon;

  if (sortState === 'asc') {
    IconComponent = ChevronUpIcon;
  } else if (sortState === 'desc') {
    IconComponent = ChevronDownIcon;
  }

  return <IconComponent {...props} />;
}

export const columns: ColumnDef<ShoeProps>[] = [
  {
    accessorKey: "brand",
    header: ({ column }) => {
      return (
        <DataTableHeaderSortButton column={column}>
          Brand
        </DataTableHeaderSortButton>
      )
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <DataTableHeaderSortButton column={column}>
          Name
        </DataTableHeaderSortButton>
      )
    },
  },
  {
    accessorKey: "color",
    header: ({ column }) => {
      return (
        <DataTableHeaderSortButton column={column}>
          Colour
        </DataTableHeaderSortButton>
      )
    },
  },
  {
    accessorKey: "count",
    header: ({ column }) => {
      return (
        <DataTableHeaderSortButton column={column}>
          Wear count
        </DataTableHeaderSortButton>
      )
    },
  },
  {
    accessorKey: "lastworndate",
    header: ({ column }) => {
      return (
        <DataTableHeaderSortButton column={column}>
          Last worn date
        </DataTableHeaderSortButton>
      )
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = dayjs(rowA.getValue(columnId), 'DD/MM/YYYY');
      const dateB = dayjs(rowB.getValue(columnId), 'DD/MM/YYYY');

      if (dateA.isBefore(dateB)) return -1;
      if (dateA.isAfter(dateB)) return 1;
      return 0;
    },
    cell: ({ row }) => {
      const lastworndate: string = row.getValue("lastworndate");
      return displayDate(lastworndate);
    }
  }
]

//----//

export default function Home() {
  const shoes = useQuery(api.shoes.get);

  if (shoes) {
    console.log('shoes API', shoes);
  }

  return (
    <ContentWrapper>
      <div className="flex justify-between mb-4">
        <Field orientation="horizontal">
          <Checkbox id="groupByBrands" name="groupByBrands" />
          <Label htmlFor="groupByBrands">
            Group by brands
          </Label>
        </Field>

        <AddWearCountDialog />

        <NewShoeDialog />
      </div>

      <DataTable columns={columns} data={SAMPLE_SHOES_DATA} />

      <div className="mt-10">
        Sort
        <MobileShoesListing />
      </div>
    </ContentWrapper>
  );
}

//----//

function AddWearCountDialog() {
  ////

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedShoe, setSelectedShoe] = useState<ShoeProps | null>(null);

  /////

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Add wear
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-80">
        <DialogHeader className="text-center">
          <DialogTitle>
            Add wear
          </DialogTitle>
        </DialogHeader>

        <div className="container mx-auto max-w-75">
          {JSON.stringify(selectedShoe)}
          <Combobox
            items={SAMPLE_SHOES_DATA}
            itemToStringLabel={(shoe: ShoeProps) => `${shoe.brand} ${shoe.name} (${shoe.color})`}
            value={selectedShoe}
            onValueChange={setSelectedShoe}
          >
            <ComboboxInput placeholder="Select shoes" />

            <ComboboxContent>
              <ComboboxEmpty>No shoes found.</ComboboxEmpty>

              <ComboboxList>
                {(shoe) => (
                  <ComboboxItem key={shoe.id} value={shoe}>
                    {`${shoe.brand} ${shoe.name} (${shoe.color})`}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            required={true}
            className="rounded-lg border w-full mt-20 mb-4"
          />

          <Button className="w-full">Add wear count</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

//----//

const newShoesFormSchema = z.object({
  name: z
    .string()
    .min(1, "Required"),
  brand: z
    .string()
    .min(1, "Required"),
  colour: z
    .string()
    .min(1, "Required"),
  startcount: z
    .coerce.number<number>({ error: 'Must be number' }),
})

function NewShoeDialog() {
  const newShoesForm = useForm<z.infer<typeof newShoesFormSchema>>({
    resolver: zodResolver(newShoesFormSchema),

    defaultValues: {
      name: "",
      brand: "",
      colour: "",
      startcount: 0,
    },
  });

  function onSubmit(data: z.infer<typeof newShoesFormSchema>) {
    // Do something with the form values.
    console.log(data)
  }

  ////

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon /> New shoes
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-80">
        <DialogHeader className="text-center">
          <DialogTitle>
            New shoe
          </DialogTitle>
        </DialogHeader>

        <div className="container mx-auto max-w-75">
          <form onSubmit={newShoesForm.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="brand"
                control={newShoesForm.control}
                render={({ field, fieldState }) => (

                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="new-shoes-form-brand">
                      Brand
                    </FieldLabel>

                    <Autocomplete value={field.value} onChange={field.onChange} fetchSuggestions={fetchSuggestions} />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="name"
                control={newShoesForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="new-shoes-form-name">
                      Name
                    </FieldLabel>

                    <Input
                      {...field}
                      id="new-shoes-form-name"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="colour"
                control={newShoesForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="new-shoes-form-colour">
                      Colour
                    </FieldLabel>

                    <Input
                      {...field}
                      id="new-shoes-form-colour"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="startcount"
                control={newShoesForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="new-shoes-form-start-count">
                      Start count
                    </FieldLabel>

                    <Input
                      {...field}
                      id="new-shoes-form-start-count"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button type="submit" className="w-full">Add shoes</Button>
            </FieldGroup>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

//----//

function DeleteShoeAction({ shoe }: { shoe: ShoeProps }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Trash2Icon />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-35 p-0 border-0">
        <Button variant="destructive">
          Confirm delete
        </Button>
      </PopoverContent>
    </Popover>
  );
}

//----//

function MobileShoesListing() {
  return (
    <>
      {SAMPLE_SHOES_DATA.map((shoe) => {
        return (
          <Item key={`${shoe.brand}-${shoe.name}`}>
            <ItemContent>
              <ItemTitle className="text-sm">
                {shoe.brand}
                {' '} • {shoe.name}
                {shoe.color && ` • ${shoe.color}`}
              </ItemTitle>

              <ItemDescription className="text-xs">
                Last worn on <b>{displayDate(shoe.lastworndate)}</b>
              </ItemDescription>
            </ItemContent>

            <ItemMedia className="self-center! block text-center">
              <div className="font-bold text-xl leading-none">
                {shoe.count}
              </div>

              <div className="text-xs">
                wears
              </div>
            </ItemMedia>
          </Item>
        )
      })}
    </>
  )
}

//----//

function displayDate(dateStr: string) {
  if (!dateStr) {
    return '-';
  }

  const dateDayjs = dayjs(dateStr, 'DD/MM/YYYY');
  const differenceInDays = dateDayjs.diff(dayjs(), 'days');

  if (differenceInDays === 0) {
    return 'Today';
  }

  if (differenceInDays === -1) {
    return 'Yesterday';
  }

  return dateDayjs.format('ddd, DD MMM YYYY');
}

//----//

