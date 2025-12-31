import {
  addTransaction,
  foundTransactionById,
  foundAllTransactions,
} from "../../services/taskService";
import * as transactionRepository from "../../repositories/taskRepository";
import BaseError from "../../utils/base-error";
import { httpStatusCodes } from "../../utils/http-status-codes";
import { ITransaction } from "../../models/Task";
import { SimpleTransaction } from "../../types/types";

// Mocked transactionRepository
jest.mock("../../repositories/transactionRepository");

const mockedTransactionRepository = transactionRepository as jest.Mocked<
  typeof transactionRepository
>;

describe("Transaction Service Tests", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("addTransaction", () => {
    it("should add a transaction and return it", async () => {
      const mockTransaction: SimpleTransaction = {
        id: "1234",
        amount: 100,
        type: "credit",
        description: "Payment",
        date: new Date(),
      };

      mockedTransactionRepository.createTransaction.mockResolvedValue(
        mockTransaction as unknown as ITransaction
      );

      const result = await addTransaction({
        amount: 100,
        type: "credit",
        description: "Payment",
        date: new Date(),
      });

      // Assertions
      expect(result).toEqual(mockTransaction);

      expect(
        mockedTransactionRepository.createTransaction
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 100,
          type: "credit",
          description: "Payment",
        })
      );
    });
  });

  describe("foundTransactionById", () => {
    it("should find a transaction by ID", async () => {
      const mockTransaction: SimpleTransaction = {
        id: "1234",
        amount: 100,
        type: "credit",
        description: "Payment",
        date: new Date(),
      };

      mockedTransactionRepository.findTransactionById.mockResolvedValue(
        mockTransaction as unknown as ITransaction
      );

      const result = await foundTransactionById({ id: "1234" });

      expect(result).toEqual(mockTransaction);
      expect(
        mockedTransactionRepository.findTransactionById
      ).toHaveBeenCalledWith("1234");
    });

    it("should throw an error if transaction does not exist", async () => {
      mockedTransactionRepository.findTransactionById.mockResolvedValue(null);

      await expect(foundTransactionById({ id: "1234" })).rejects.toThrow(
        new BaseError("Transaction does not exist!", httpStatusCodes.NOT_FOUND)
      );
    });
  });

  describe("foundAllTransactions", () => {
    it("should find all transactions", async () => {
      const mockTransaction: Partial<ITransaction> = {
        id: "1234",
        amount: 100,
        type: "credit",
        description: "Payment",
        date: new Date(),
      };

      const mockTransactions = {
        totalItems: 20,
        totalPages: Math.ceil(20 / 10),
        currentPage: 1,
        transactions: [mockTransaction as ITransaction],
      };

      jest
        .spyOn(transactionRepository, "countTransactions")
        .mockResolvedValue(mockTransactions.totalItems);
      jest
        .spyOn(transactionRepository, "findAllTransactions")
        .mockResolvedValue(mockTransactions.transactions);

      const result = await foundAllTransactions(1, 10);

      expect(result).toEqual(mockTransactions);
      expect(transactionRepository.findAllTransactions).toHaveBeenCalledWith(
        10,
        0
      );
    });

    it("should return empty transactions if no transactions found", async () => {
      const mockTransactions = {
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        transactions: [],
      };

      jest
        .spyOn(transactionRepository, "countTransactions")
        .mockResolvedValue(mockTransactions.totalItems);
      jest
        .spyOn(transactionRepository, "findAllTransactions")
        .mockResolvedValue(mockTransactions.transactions);

      const result = await foundAllTransactions(1, 10);

      expect(result).toEqual(mockTransactions);
      expect(transactionRepository.findAllTransactions).toHaveBeenCalledWith(
        10,
        0
      );
    });
  });
});
