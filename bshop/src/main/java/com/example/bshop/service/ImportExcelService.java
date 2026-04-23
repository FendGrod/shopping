package com.example.bshop.service;

import com.example.bshop.model.Produit;
import com.example.bshop.repository.ProduitRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class ImportExcelService {

    private final ProduitRepository produitRepository;

    public ImportExcelService(ProduitRepository produitRepository) {
        this.produitRepository = produitRepository;
    }

    public List<Produit> importProduitsFromExcel(MultipartFile file) {
        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            List<Produit> produits = new ArrayList<>();

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Skip header

                try {
                    Produit produit = new Produit();
                    produit.setNom(getCellValueAsString(row.getCell(0)));
                    produit.setDescription(getCellValueAsString(row.getCell(1)));
                    produit.setPrix(getCellValueAsDouble(row.getCell(2)));
                    produit.setStock((int) getCellValueAsDouble(row.getCell(3)));
                    produit.setImageUrl(getCellValueAsString(row.getCell(4)));
                    produit.setCategorie(getCellValueAsString(row.getCell(5)));
                    produit.setSousCategorie(getCellValueAsString(row.getCell(6)));
                    produit.setGenre(getCellValueAsString(row.getCell(7)));

                    produits.add(produit);
                } catch (Exception e) {
                    System.err.println("Erreur ligne " + row.getRowNum() + ": " + e.getMessage());
                }
            }

            return produitRepository.saveAll(produits);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de l'import Excel: " + e.getMessage());
        }
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