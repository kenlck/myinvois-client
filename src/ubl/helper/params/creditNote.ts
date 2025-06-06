// --- User-Friendly Parameter Interfaces - Credit Note Specific ---

import {
  InvoiceTypeCode, // Reused, but will specify "02" for credit notes
} from "myinvois-client/codes";
import { UBLJsonExtensions } from "../../json/ubl_json"; // Reused for v1.1 extensions
import {
  AddressParam,
  SupplierPartyParam,
  CustomerPartyParam,
  ItemCommodityClassificationParam,
  TaxSubtotalParam,
  PaymentMeansParam,
  PaymentTermsParam,
  PrepaidPaymentParam,
  AllowanceChargeParam,
  DeliveryParam,
  AdditionalDocRefParam,
  LegalMonetaryTotalParam,
} from "../params/common";

/**
 * User-friendly parameters for defining a credit note line item.
 * Adapted from InvoiceLineParam.
 */
export interface CreditNoteLineParam {
  /** Unique identifier for the credit note line (e.g., item number "1", "2", etc.). */
  id: string;
  /** Number of units of the product or service being credited. E.g., 1.00. */
  quantity: number;
  /**
   * Standard unit or system used to measure the product or service (UN/ECE Recommendation 20).
   * E.g., "KGM" for kilograms, "UNT" for unit. Optional.
   */
  unitCode?: string;
  /**
   * Subtotal for the line item being credited: Amount of each individual item/service, excluding taxes, charges, or discounts.
   * This maps to `ItemPriceExtension/Amount` in UBL, which is used for line item subtotal in MyInvois.
   * E.g., 100.00.
   */
  subtotal: number;
  /** Description of the product or service being credited. E.g., "Laptop Peripherals". Mandatory. */
  itemDescription?: string;
  /** Commodity classification details for the item being credited. */
  itemCommodityClassification: ItemCommodityClassificationParam;
  /** Price assigned to a single unit of the product or service being credited. E.g., 17.00. */
  unitPrice: number;
  /**
   * Tax details for this specific line item. Optional.
   * If provided, `taxAmount` and at least one `taxSubtotal` are expected.
   */
  lineTaxTotal?: {
    /** Total tax amount for this line item. E.g., 8.76. */
    taxAmount: number;
    /** Breakdown of taxes for this line item by category/rate. */
    taxSubtotals: Array<TaxSubtotalParam>;
  };
  /** Optional list of allowances or charges specific to this line item. */
  allowanceCharges?: AllowanceChargeParam[];
}

/**
 * User-friendly parameters for defining the overall tax total for the credit note.
 * Adapted from InvoiceTaxTotalParam.
 */
export interface CreditNoteTaxTotalParam {
  /** Total tax amount for the entire credit note. E.g., 87.63. */
  totalTaxAmount: number;
  /** Breakdown of taxes by category/rate for the entire credit note. */
  taxSubtotals: Array<TaxSubtotalParam>;
  /** Optional. Rounding amount applied to the total tax. E.g., 0.03 (for positive rounding). */
  roundingAmount?: number;
}

/**
 * User-friendly parameters for defining a billing period associated with the credit note (e.g., for a recurring service credit).
 */
export interface CreditNotePeriodParam {
  /** Start date of the period (YYYY-MM-DD). Optional. E.g., "2017-11-26". */
  startDate?: string;
  /** End date of the period (YYYY-MM-DD). Optional. E.g., "2017-11-30". */
  endDate?: string;
  /** Description of the frequency (e.g., "Monthly"). Optional. */
  description?: string;
}

/**
 * User-friendly parameters for defining a billing reference, linking the credit note to the original invoice.
 * A credit note can reference one or more original invoices.
 */
export interface BillingReferenceParam {
  /** The ID of the original invoice being referenced. */
  invoiceId: string;
  /** The issue date of the original invoice being referenced (YYYY-MM-DD). Optional but recommended. */
  invoiceIssueDate?: string;
  // More fields from UBLJsonDocumentReference could be added here if needed,
  // but ID and IssueDate are the most common for BillingReference/InvoiceDocumentReference.
}

/**
 * Comprehensive user-friendly parameters for creating a full UBL Credit Note document (supports v1.0 and v1.1).
 * This interface is designed to abstract many of the complexities of direct UBL JSON construction.
 */
export interface CreateCreditNoteDocumentParams {
  /**
   * Credit Note Code / Number: Document reference number used by Supplier for internal tracking.
   * E.g., "CN12345". Mandatory.
   */
  id: string;
  /**
   * Credit Note Date: Date of issuance of the Credit Note (YYYY-MM-DD).
   * Note: MyInvois expects this to be the current date in UTC timezone.
   * E.g., "2024-07-30". Mandatory.
   */
  issueDate: string;
  /**
   * Credit Note Time: Time of issuance of the Credit Note (HH:MM:SSZ or HH:MM:SS+HH:MM).
   * Note: MyInvois expects this to be the current time.
   * E.g., "10:00:00Z". Mandatory.
   */
  issueTime: string;
  /**
   * Document Type Code: Identifies the document type.
   * For a Credit Note, this must be "02". This parameter will be set by the builder.
   */
  invoiceTypeCode?: "02"; // Explicitly setting the expected value

  /**
   * Credit Note Currency Code: Specific currency for monetary values in the Credit Note.
   * E.g., "MYR". Mandatory.
   */
  documentCurrencyCode: string;
  /**
   * Tax Currency Code. Optional. If not provided, defaults to `documentCurrencyCode`.
   * E.g., "MYR".
   */
  taxCurrencyCode?: string;

  /** Supplier (seller) details. Mandatory. */
  supplier: SupplierPartyParam;
  /** Customer (buyer) details. Mandatory. */
  customer: CustomerPartyParam;

  /**
   * Array of credit note line items. At least one line item is typically mandatory
   * unless it's a document-level credit/charge.
   */
  creditNoteLines: CreditNoteLineParam[];
  /** Overall tax total for the credit note. Mandatory. */
  taxTotal: CreditNoteTaxTotalParam;
  /** Legal monetary total summary for the credit note. Mandatory. */
  legalMonetaryTotal: LegalMonetaryTotalParam;

  /**
   * Billing reference information, crucial for linking the credit note to the original invoice(s).
   * An array as a credit note can reference multiple invoices. Mandatory.
   */
  billingReferences: BillingReferenceParam[];

  /** Optional. Billing period information. */
  creditNotePeriod?: CreditNotePeriodParam[];
  /** Optional. List of additional document references. */
  additionalDocumentReferences?: AdditionalDocRefParam[];
  /** Optional. Delivery information. */
  delivery?: DeliveryParam[];
  /** Optional. Payment means information related to the credit. */
  paymentMeans?: PaymentMeansParam[];
  /** Optional. Payment terms description for the credit. */
  paymentTerms?: PaymentTermsParam[];
  /** Optional. List of prepaid payments associated with the original invoice that are being reversed/credited. */
  prepaidPayments?: PrepaidPaymentParam[];
  /** Optional. Document-level allowances or charges applied to the credit note. */
  allowanceCharges?: AllowanceChargeParam[];

  /**
   * UBL Extensions. Primarily used for digital signatures in v1.1 credit notes.
   * Users needing complex extensions might need to construct `UBLJsonExtensions` objects directly.
   * For v1.1, if a signature is applied by the builder, this will be populated.
   * Optional.
   */
  ublExtensions?: UBLJsonExtensions;

  /**
   * Signature ID for v1.1 credit notes. Optional.
   * If not provided, a default is used by the builder (e.g., "urn:oasis:names:specification:ubl:signature:CreditNote").
   * Relevant only when generating a v1.1 credit note that will be signed.
   */
  signatureId?: string;
  /**
   * Signature Method for v1.1 credit notes. Optional.
   * If not provided, a default is used by the builder (e.g., "urn:oasis:names:specification:ubl:dsig:enveloped:xades").
   * Relevant only when generating a v1.1 credit note that will be signed.
   */
  signatureMethod?: string;

  // OrderReference, DespatchDocumentReference, ReceiptDocumentReference, OriginatorDocumentReference,
  // ContractDocumentReference, PayeeParty, TaxRepresentativeParty, TaxExchangeRate
  // are omitted for simplicity in this initial helper but can be added if needed.
}
