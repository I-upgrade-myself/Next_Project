"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button" 
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilter, setColumnFilter] = useState<ColumnFiltersState>([])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilter,
    state: {
      sorting,
      columnFilters: columnFilter
    }
  })
  
  return (
    <div className="rounded-md border">
      <Card>
  <CardHeader>
    <CardTitle>Your Products</CardTitle>
    <CardDescription>{" "}
       Update, delete and edit your products</CardDescription>
  </CardHeader>
  <CardContent>
    <div>
      <div> 
        <Input placeholder="Filter Products" value={(table.getColumn('title')?.getFilterValue() as string) ?? ""}
        onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
        ></Input>
      </div>
  <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end gap-4 pt-4">
        <Button disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} variant="outline">
          <ChevronLeft className="w-4 h-4"></ChevronLeft>
          <span>Go to previous page</span>
        </Button>
        <Button disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} variant="outline">
          <ChevronRight className="w-4 h-4"></ChevronRight>
          <span>Go to the next page</span>
        </Button>
      </div>
      </div>
  </CardContent>
</Card>

     
    </div>
  )
}
