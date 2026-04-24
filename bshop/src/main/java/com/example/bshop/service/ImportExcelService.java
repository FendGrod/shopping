package com.example.bshop.service;

import com.example.bshop.model.Produit;
import com.example.bshop.repository.ProduitRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class ImportExcelService {

    private final ProduitRepository produitRepository;

    public ImportExcelService(ProduitRepository produitRepository) {
        this.produitRepository = produitRepository;
    }

    public List<Produit> importProduitsFromExcel(MultipartFile file) {
        try {
            String fileName = file.getOriginalFilename();
            if (fileName != null && fileName.endsWith(".csv")) {
                return importFromCSV(file);
            } else {
                return importFromExcel(file);
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de l'import: " + e.getMessage());
        }
    }

    // Import depuis un vrai fichier Excel (.xlsx)
    private List<Produit> importFromExcel(MultipartFile file) throws Exception {
        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            List<Produit> produits = new ArrayList<>();

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Skip header

                try {
                    Produit produit = extractProduitFromRow(row);
                    produits.add(produit);
                } catch (Exception e) {
                    System.err.println("Erreur ligne " + row.getRowNum() + ": " + e.getMessage());
                }
            }

            return produitRepository.saveAll(produits);
        }
    }

    // Import depuis un fichier CSV
    private List<Produit> importFromCSV(MultipartFile file) throws Exception {
        List<Produit> produits = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            int lineNum = 0;

            while ((line = br.readLine()) != null) {
                lineNum++;
                if (lineNum == 1) continue; // Skip header

                String[] columns = line.split(",");
                if (columns.length < 8) continue;

                try {
                    Produit produit = new Produit();

                    // Nettoyer les guillemets et espaces
                    produit.setNom(cleanCSVValue(columns[0]));
                    produit.setDescription(cleanCSVValue(columns[1]));
                    produit.setPrix(Double.parseDouble(cleanCSVValue(columns[2])));
                    produit.setStock((int) Double.parseDouble(cleanCSVValue(columns[3])));
                    produit.setImageUrl(cleanCSVValue(columns[4]));
                    produit.setCategorie(cleanCSVValue(columns[5]));
                    produit.setSousCategorie(cleanCSVValue(columns[6]));
                    produit.setGenre(cleanCSVValue(columns[7]));

                    // Colonnes optionnelles
                    if (columns.length > 8 && !cleanCSVValue(columns[8]).isEmpty()) {
                        produit.setPrixOriginal(Double.parseDouble(cleanCSVValue(columns[8])));
                    }
                    if (columns.length > 9 && !cleanCSVValue(columns[9]).isEmpty()) {
                        produit.setRating(Double.parseDouble(cleanCSVValue(columns[9])));
                    }
                    if (columns.length > 10) {
                        produit.setIsPromo(Boolean.parseBoolean(cleanCSVValue(columns[10])));
                    }
                    if (columns.length > 11) {
                        produit.setIsNew(Boolean.parseBoolean(cleanCSVValue(columns[11])));
                    }
                    if (columns.length > 12 && !cleanCSVValue(columns[12]).isEmpty()) {
                        String taillesStr = cleanCSVValue(columns[12]);
                        produit.setTailles(Arrays.asList(taillesStr.split(",")));
                    }
                    if (columns.length > 13 && !cleanCSVValue(columns[13]).isEmpty()) {
                        String couleursStr = cleanCSVValue(columns[13]);
                        produit.setCouleurs(Arrays.asList(couleursStr.split(",")));
                    }

                    produits.add(produit);
                } catch (Exception e) {
                    System.err.println("Erreur ligne " + lineNum + ": " + e.getMessage());
                }
            }
        }

        return produitRepository.saveAll(produits);
    }

    private Produit extractProduitFromRow(Row row) {
        Produit produit = new Produit();
        produit.setNom(getCellValueAsString(row.getCell(0)));
        produit.setDescription(getCellValueAsString(row.getCell(1)));
        produit.setPrix(getCellValueAsDouble(row.getCell(2)));
        produit.setStock((int) getCellValueAsDouble(row.getCell(3)));
        produit.setImageUrl(getCellValueAsString(row.getCell(4)));
        produit.setCategorie(getCellValueAsString(row.getCell(5)));
        produit.setSousCategorie(getCellValueAsString(row.getCell(6)));
        produit.setGenre(getCellValueAsString(row.getCell(7)));

        if (getCellValueAsDouble(row.getCell(8)) > 0) {
            produit.setPrixOriginal(getCellValueAsDouble(row.getCell(8)));
        }
        if (getCellValueAsDouble(row.getCell(9)) > 0) {
            produit.setRating(getCellValueAsDouble(row.getCell(9)));
        }
        produit.setIsPromo(Boolean.parseBoolean(getCellValueAsString(row.getCell(10))));
        produit.setIsNew(Boolean.parseBoolean(getCellValueAsString(row.getCell(11))));

        String taillesStr = getCellValueAsString(row.getCell(12));
        if (taillesStr != null && !taillesStr.isEmpty()) {
            produit.setTailles(Arrays.asList(taillesStr.split(",")));
        }

        String couleursStr = getCellValueAsString(row.getCell(13));
        if (couleursStr != null && !couleursStr.isEmpty()) {
            produit.setCouleurs(Arrays.asList(couleursStr.split(",")));
        }

        return produit;
    }

    private String cleanCSVValue(String value) {
        if (value == null) return "";
        // Enlever les guillemets au début et à la fin
        value = value.trim();
        if (value.startsWith("\"") && value.endsWith("\"")) {
            value = value.substring(1, value.length() - 1);
        }
        return value;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC: return String.valueOf((int) cell.getNumericCellValue());
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            default: return "";
        }
    }

    private double getCellValueAsDouble(Cell cell) {
        if (cell == null) return 0;
        switch (cell.getCellType()) {
            case NUMERIC: return cell.getNumericCellValue();
            case STRING:
                try {
                    return Double.parseDouble(cell.getStringCellValue());
                } catch (NumberFormatException e) {
                    return 0;
                }
            default: return 0;
        }
    }
}