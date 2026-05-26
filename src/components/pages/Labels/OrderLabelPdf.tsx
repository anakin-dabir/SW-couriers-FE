import type React from 'react';
import { Document, Image, Page, Rect, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';
import { LABEL_PDF_FONT_FAMILY } from '@/lib/labelPdfFonts';

export const LABEL_PDF_WIDTH = 380;
export const LABEL_PDF_HEIGHT = 640;

const COLOR_BLACK = '#030303';
const COLOR_WHITE = '#FFFFFF';
const QR_SIZE = 80;
const HORIZONTAL_BARCODE_HEIGHT = 64;
const HORIZONTAL_BARCODE_MAX_WIDTH = 280;
const VERTICAL_BARCODE_WIDTH = 64;
const VERTICAL_BARCODE_MAX_HEIGHT = 280;

export interface BarcodeImage {
  src: string;
  width: number;
  height: number;
}

export interface LabelSpec {
  id: string;
  labelType: 'master' | 'package';
  trackingId: string;
  orderIdText?: string;
  qrValue: string;
  barcodeValue: string;
  rightHeaderText: string;
  primaryTitle: string;
  primaryAddress: string;
  secondaryTitle?: string;
  secondaryAddress?: string;
  packageIdText: string;
  weightText: string;
  dimensionsText: string;
  volumeText: string;
  returnAddressText: string;
  deliveryStopsText?: string;
  totalPackagesText?: string;
  signatureRequired?: boolean;
}

export interface PreparedLabel extends LabelSpec {
  horizontalBarcode: BarcodeImage;
  verticalBarcode: BarcodeImage;
  qrDataUrl: string;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLOR_WHITE,
    fontFamily: LABEL_PDF_FONT_FAMILY,
    color: COLOR_BLACK,
    position: 'relative',
  },
  borderTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 3,
    backgroundColor: COLOR_BLACK,
  },
  borderBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: COLOR_BLACK,
  },
  borderLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 3,
    backgroundColor: COLOR_BLACK,
  },
  borderRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 3,
    backgroundColor: COLOR_BLACK,
  },
  divider: { height: 1, backgroundColor: COLOR_BLACK, width: '100%' },
  dividerDouble: { height: 2, backgroundColor: COLOR_BLACK, width: '100%' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  logo: { width: 80, height: 52, objectFit: 'contain' },
  urlText: { fontSize: 10, color: COLOR_BLACK },
  orderStripMaster: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  orderStripPackage: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderStripBoldText: { fontSize: 12, fontWeight: 700, color: COLOR_BLACK },
  orderStripText: { fontSize: 12, fontWeight: 400, color: COLOR_BLACK },
  middleRow: { flexDirection: 'row', minHeight: 252 },
  middleLeft: { flex: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24, gap: 24 },
  addressTitle: { fontSize: 11, fontWeight: 700, color: COLOR_BLACK, marginBottom: 4 },
  addressBody: { fontSize: 11, color: COLOR_BLACK, lineHeight: 1.35 },
  middleRight: {
    width: 132,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  middleRightDivider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 1,
    backgroundColor: COLOR_BLACK,
  },
  barcodeQrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 16,
  },
  barcodeColumn: { flex: 1, alignItems: 'flex-start' },
  barcodeStack: { alignItems: 'center', alignSelf: 'flex-start' },
  packageIdText: {
    fontSize: 11,
    fontWeight: 700,
    color: COLOR_BLACK,
    textAlign: 'center',
    paddingTop: 12,
  },
  qrFrame: {
    borderWidth: 1,
    borderColor: '#111',
    padding: 4,
    alignSelf: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 16,
  },
  metaLeft: { gap: 6, flex: 1 },
  metaLine: { fontSize: 9, color: COLOR_BLACK },
  metaBold: { fontWeight: 700 },
  returnBlock: { maxWidth: 144 },
  returnTitle: { fontSize: 9, fontWeight: 700, color: COLOR_BLACK, textTransform: 'uppercase' },
  returnBody: { fontSize: 9, color: COLOR_BLACK, lineHeight: 1.4, marginTop: 4 },
  bottomStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 16,
  },
  bottomText: { fontSize: 10, fontWeight: 700, color: COLOR_BLACK },
  bottomTextRight: {
    fontSize: 10,
    fontWeight: 700,
    color: COLOR_BLACK,
    textTransform: 'uppercase',
    textAlign: 'right',
  },
});

function MasterBadge(): React.JSX.Element {
  return (
    <Svg width={132} height={26} viewBox="0 0 132 26">
      <Rect x={0} y={0} width={132} height={26} rx={13} ry={13} fill={COLOR_BLACK} />
      <Text
        x={66}
        y={17}
        fill={COLOR_WHITE}
        textAnchor="middle"
        style={{ fontSize: 11, fontWeight: 700, fontFamily: LABEL_PDF_FONT_FAMILY }}
      >
        MASTER LABEL
      </Text>
    </Svg>
  );
}

function fitBarcode(
  image: BarcodeImage,
  fixedHeight: number,
  maxWidth: number
): { width: number; height: number } {
  if (image.width === 0 || image.height === 0) {
    return { width: maxWidth, height: fixedHeight };
  }
  const aspectRatio = image.width / image.height;
  const widthFromHeight = fixedHeight * aspectRatio;
  if (widthFromHeight <= maxWidth) {
    return { width: widthFromHeight, height: fixedHeight };
  }
  const heightFromWidth = maxWidth / aspectRatio;
  return { width: maxWidth, height: heightFromWidth };
}

function fitRotatedBarcode(
  image: BarcodeImage,
  fixedWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (image.width === 0 || image.height === 0) {
    return { width: fixedWidth, height: maxHeight };
  }
  const aspectRatio = image.width / image.height;
  const heightFromWidth = fixedWidth / aspectRatio;
  if (heightFromWidth <= maxHeight) {
    return { width: fixedWidth, height: heightFromWidth };
  }
  const widthFromHeight = maxHeight * aspectRatio;
  return { width: widthFromHeight, height: maxHeight };
}

interface LabelPageProps {
  label: PreparedLabel;
  logoDataUrl: string;
}

function LabelPage({ label, logoDataUrl }: LabelPageProps): React.JSX.Element {
  const isMaster = label.labelType === 'master';
  const horizontalSize = fitBarcode(
    label.horizontalBarcode,
    HORIZONTAL_BARCODE_HEIGHT,
    HORIZONTAL_BARCODE_MAX_WIDTH
  );
  const verticalSize = fitRotatedBarcode(
    label.verticalBarcode,
    VERTICAL_BARCODE_WIDTH,
    VERTICAL_BARCODE_MAX_HEIGHT
  );

  return (
    <Page size={[LABEL_PDF_WIDTH, LABEL_PDF_HEIGHT]} style={styles.page}>
      <View style={styles.borderTop} fixed />
      <View style={styles.borderBottom} fixed />
      <View style={styles.borderLeft} fixed />
      <View style={styles.borderRight} fixed />

      <View style={styles.headerRow}>
        <Image src={logoDataUrl} style={styles.logo} />
        <Text style={styles.urlText}>www.swcouriers.co.uk</Text>
      </View>
      <View style={styles.divider} />

      {isMaster ? (
        <View style={styles.orderStripMaster}>
          <MasterBadge />
          <Text style={styles.orderStripBoldText}>
            Order ID: #{label.orderIdText ?? label.trackingId}
          </Text>
        </View>
      ) : (
        <View style={styles.orderStripPackage}>
          <Text style={styles.orderStripText}>Tracking ID #{label.trackingId}</Text>
        </View>
      )}
      <View style={styles.divider} />

      <View style={styles.middleRow}>
        <View style={styles.middleLeft}>
          <View>
            <Text style={styles.addressTitle}>{label.primaryTitle}</Text>
            <Text style={styles.addressBody}>{label.primaryAddress}</Text>
          </View>
          {label.secondaryTitle && label.secondaryAddress ? (
            <View>
              <Text style={styles.addressTitle}>{label.secondaryTitle}</Text>
              <Text style={styles.addressBody}>{label.secondaryAddress}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.middleRight}>
          <View style={styles.middleRightDivider} />
          <Image
            src={label.verticalBarcode.src}
            style={{ width: verticalSize.width, height: verticalSize.height }}
          />
        </View>
      </View>

      <View style={styles.dividerDouble} />

      <View style={styles.barcodeQrRow}>
        <View style={styles.barcodeColumn}>
          <View style={styles.barcodeStack}>
            <Image
              src={label.horizontalBarcode.src}
              style={{ width: horizontalSize.width, height: horizontalSize.height }}
            />
            <Text style={styles.packageIdText}>{label.packageIdText}</Text>
          </View>
        </View>
        <View style={styles.qrFrame}>
          <Image src={label.qrDataUrl} style={{ width: QR_SIZE, height: QR_SIZE }} />
        </View>
      </View>

      <View style={styles.dividerDouble} />

      <View style={styles.metaRow}>
        <View style={styles.metaLeft}>
          {isMaster ? (
            <>
              <Text style={styles.metaLine}>
                <Text style={styles.metaBold}>Delivery Stops: </Text>
                {label.deliveryStopsText ?? '—'}
              </Text>
              <Text style={styles.metaLine}>
                <Text style={styles.metaBold}>Total Packages: </Text>
                {label.totalPackagesText ?? '—'}
              </Text>
            </>
          ) : null}
          <Text style={styles.metaLine}>
            <Text style={styles.metaBold}>{isMaster ? 'Total Weight: ' : 'Weight: '}</Text>
            {label.weightText}
          </Text>
          {!isMaster ? (
            <Text style={styles.metaLine}>
              <Text style={styles.metaBold}>Dimensions: </Text>
              {label.dimensionsText}
            </Text>
          ) : null}
          <Text style={styles.metaLine}>
            <Text style={styles.metaBold}>{isMaster ? 'Total Volume: ' : 'Volume: '}</Text>
            {label.volumeText}
          </Text>
        </View>
        {!isMaster ? (
          <View style={styles.returnBlock}>
            <Text style={styles.returnTitle}>Return Address:</Text>
            <Text style={styles.returnBody}>{label.returnAddressText}</Text>
          </View>
        ) : null}
      </View>

      {!isMaster ? (
        <>
          <View style={styles.divider} />
          <View style={styles.bottomStrip}>
            <Text style={styles.bottomText}>
              Signature Required: {label.signatureRequired ? 'YES' : 'NO'}
            </Text>
            <Text style={styles.bottomTextRight}>{label.rightHeaderText}</Text>
          </View>
        </>
      ) : null}
    </Page>
  );
}

interface OrderLabelPdfProps {
  labels: PreparedLabel[];
  logoDataUrl: string;
  title?: string;
}

export default function OrderLabelPdf({
  labels,
  logoDataUrl,
  title,
}: OrderLabelPdfProps): React.JSX.Element {
  return (
    <Document title={title ?? 'Order Labels'}>
      {labels.map((label) => (
        <LabelPage key={label.id} label={label} logoDataUrl={logoDataUrl} />
      ))}
    </Document>
  );
}
