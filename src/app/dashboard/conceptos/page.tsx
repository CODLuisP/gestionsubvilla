"use client"

import { useState } from "react"
import { Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function ConceptosPage() {
  
  // Datos iniciales de conceptos
  const [conceptos, setConceptos] = useState([
    { id: 1, nombre: "SS.HH", precio: 5 },
    { id: 2, nombre: "GPS", precio: 6 },
    { id: 3, nombre: "Cotización", precio: 10 },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [newConcepto, setNewConcepto] = useState({ nombre: "", precio: "" })
  const [open, setOpen] = useState(false)

  // Filtrar conceptos según el término de búsqueda
  const filteredConceptos = conceptos.filter((concepto) =>
    concepto.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Agregar un nuevo concepto
  const handleAddConcepto = () => {
    if (newConcepto.nombre && newConcepto.precio) {
      setConceptos([
        ...conceptos,
        {
          id: conceptos.length + 1,
          nombre: newConcepto.nombre,
          precio: Number(newConcepto.precio),
        },
      ])
      setNewConcepto({ nombre: "", precio: "" })
      setOpen(false)
    }
  }

  // Eliminar un concepto
  const handleDeleteConcepto = (id: number) => {
    setConceptos(conceptos.filter((concepto) => concepto.id !== id))
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Conceptos</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar conceptos..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Concepto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Concepto</DialogTitle>
                <DialogDescription>Ingrese los detalles del nuevo concepto a agregar.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="nombre"
                    value={newConcepto.nombre}
                    onChange={(e) => setNewConcepto({ ...newConcepto, nombre: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="precio" className="text-right">
                    Precio (S/.)
                  </Label>
                  <Input
                    id="precio"
                    type="number"
                    value={newConcepto.precio}
                    onChange={(e) => setNewConcepto({ ...newConcepto, precio: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddConcepto}>Guardar Concepto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {conceptos.map((concepto) => (
          <Card key={concepto.id} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleDeleteConcepto(concepto.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle>{concepto.nombre}</CardTitle>
              <CardDescription>Concepto de servicio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">S/. {concepto.precio.toFixed(2)}</div>
            </CardContent>
            <CardFooter>
              <Badge variant="outline">Activo</Badge>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Conceptos</CardTitle>
          <CardDescription>Visualización detallada de todos los conceptos disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio (S/.)</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConceptos.length > 0 ? (
                filteredConceptos.map((concepto) => (
                  <TableRow key={concepto.id}>
                    <TableCell className="font-medium">{concepto.id}</TableCell>
                    <TableCell>{concepto.nombre}</TableCell>
                    <TableCell>{concepto.precio.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteConcepto(concepto.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No se encontraron conceptos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
