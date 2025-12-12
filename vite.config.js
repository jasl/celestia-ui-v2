import { defineConfig } from "vite"
import { resolve, relative } from "node:path"
import fs from "node:fs"
import tailwindcss from "@tailwindcss/vite"

// Source directory
const srcDir = resolve(__dirname, "src")

// Get all HTML files in the src directory
const getHtmlFiles = (dir) => {
    let results = []
    const list = fs.readdirSync(dir)
    list.forEach((file) => {
        const filePath = resolve(dir, file)
        const stat = fs.statSync(filePath)
        if (stat && stat.isDirectory()) {
            results = results.concat(getHtmlFiles(filePath))
        } else if (stat && stat.isFile() && file.endsWith(".html")) {
            results.push(filePath)
        }
    })
    return results
}

const htmlFiles = getHtmlFiles(srcDir)
const input = Object.fromEntries(
    htmlFiles.map((file) => {
        const rel = relative(srcDir, file).split("\\").join("/")
        const name = rel.replace(".html", "").split("/").join("-")
        return [name, file]
    })
)

export default defineConfig({
    base: "",
    root: "src",
    publicDir: resolve(__dirname, "public"),
    server: {
        open: "/index.html",
        port: 3000,
    },
    plugins: [tailwindcss()],
    build: {
        outDir: resolve(__dirname, "dist"),
        emptyOutDir: true,
        rollupOptions: {
            input,
            output: {
                entryFileNames: `js/[name].js`,
                chunkFileNames: `js/[name].js`,
                assetFileNames: `assets/[name].[ext]`,
            },
        },
    },
})

